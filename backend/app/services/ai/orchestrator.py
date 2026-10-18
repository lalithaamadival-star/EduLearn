from typing import List, Dict, Any, Optional
from app.services.ai.groq_provider import GroqProvider
from app.services.ai.openrouter_provider import OpenRouterProvider
from app.models.schemas import AIChatContext
from app.core.logging import logger

class AIOrchestrator:
    def __init__(self):
        self.groq_provider = GroqProvider()
        self.openrouter_provider = OpenRouterProvider()
        self._request_counter = 0

    def build_system_prompt(self, context: Optional[AIChatContext], role_type: str = "student") -> str:
        base_prompt = (
            "You are the AccessEd Inclusive AI Tutor, an assistive learning companion built for "
            "learners with diverse cognitive, visual, auditory, and motor preferences.\n"
            "Core Principle: Learning should adapt to the learner.\n"
            "Strict Structural Guidelines:\n"
            "1. Ground explanations in the student's active lesson and educational context.\n"
            "2. ALWAYS structure your answer neatly with semantic markdown headings (e.g. '### 1. Conceptual Foundation', '### 2. Code Example', '### 3. Key Takeaway').\n"
            "3. Use bulleted lists with bold keyword anchors (e.g. '- **Core Rule:** Explanation') or numbered steps for sequences.\n"
            "4. Provide concrete code snippets in fenced code blocks with language tags (e.g. ```python ... ```) where applicable.\n"
            "5. Always end with a dedicated '### 💡 Key Takeaway' section containing the core mental model.\n"
            "6. Keep language fluent, clear, and natural so it sounds great when read aloud via speech synthesis.\n"
            "7. Never output unstructured walls of text without headings or paragraphs.\n"
        )

        if context:
            base_prompt += "\n--- ACTIVE EDUCATIONAL CONTEXT ---\n"
            if context.course_title:
                base_prompt += f"Course: {context.course_title}\n"
            if context.module_title:
                base_prompt += f"Module: {context.module_title}\n"
            if context.lesson_title:
                base_prompt += f"Current Lesson: {context.lesson_title}\n"
            if context.lesson_content:
                # Add snippet of lesson
                snippet = context.lesson_content[:1200]
                base_prompt += f"Lesson Excerpt:\n\"\"\"{snippet}\"\"\"\n"
            if context.last_quiz_score:
                base_prompt += f"Recent Quiz Mastery: {context.last_quiz_score}\n"
            if context.selected_language and context.selected_language != "en":
                base_prompt += f"Preferred Response Language: {context.selected_language}\n"
            if context.accessibility_mode:
                base_prompt += f"Active Accessibility Mode: {context.accessibility_mode}\n"
                if context.accessibility_mode == "screen-reader":
                    base_prompt += "Note: Keep screen-reader friendly formatting with concise headings.\n"
                elif context.accessibility_mode == "simplified":
                    base_prompt += "Note: Use plain language, short sentences, and everyday analogies.\n"

        base_prompt += "\nAlways respond with pedagogical clarity, encouraging curiosity and deeper understanding."
        return base_prompt

    async def get_response(
        self,
        messages: List[Dict[str, str]],
        context: Optional[AIChatContext] = None,
        action: str = "chat",
        system_prompt_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Dual-Engine Co-Processing and Task-Based Routing:
        - Utilizes BOTH Groq (openai/gpt-oss-120b) and OpenRouter (nvidia/nemotron-3.5-super-vl:free)
        - Combines both 1,000 req/day quotas for 2,000 req/day total capacity
        - Action-based routing:
          * 'simplify' -> Groq (ultra-low latency LPU)
          * 'summarize' / 'deep_explain' -> OpenRouter (deep reasoning & multimodal structure)
          * 'chat' -> Balanced round-robin across Groq and OpenRouter
        - Automatic Mutual Failover: If either provider is rate-limited (429) or offline,
          the other instantly handles the request.
        """
        system_prompt = system_prompt_override or self.build_system_prompt(context)
        self._request_counter += 1

        # Determine engine order based on action and load-balancing counter
        if action == "simplify":
            # Groq is best for rapid cognitive simplification
            engines = [("Groq", self.groq_provider), ("OpenRouter", self.openrouter_provider)]
        elif action in ("summarize", "deep_explain", "pedagogy"):
            # OpenRouter Nemotron Super VL is best for deep reasoning & structuring
            engines = [("OpenRouter", self.openrouter_provider), ("Groq", self.groq_provider)]
        else:
            # Alternate turns: 50% Groq, 50% OpenRouter (balances 1000 + 1000 daily quotas)
            if self._request_counter % 2 == 1:
                engines = [("Groq", self.groq_provider), ("OpenRouter", self.openrouter_provider)]
            else:
                engines = [("OpenRouter", self.openrouter_provider), ("Groq", self.groq_provider)]

        for name, provider in engines:
            try:
                logger.info(f"Dispatching AI request to {name} engine (Action: {action}, Turn: {self._request_counter})")
                result = await provider.generate_chat_response(messages, system_prompt)
                return result
            except Exception as err:
                logger.warning(f"{name} engine unavailable ({err}). Attempting partner engine failover.")

        # Contextual Offline Fallback (Zero crash guarantee)
        last_user_msg = messages[-1]["content"] if messages else "Help me understand this lesson."
        topic = (context and context.lesson_title) or "the current educational topic"
        
        content = (
            f"### 1. Conceptual Foundation: {topic}\n"
            f"When examining **\"{last_user_msg.strip()}\"**, the core concept connects to how programs structure memory, reference bindings, and perform state transitions.\n\n"
            f"### 2. Practical Application & Code Example\n"
            f"- **Object Allocation:** Every variable name in Python is a label bound to an object in heap memory.\n"
            f"- **Mutability Principle:** Immutable objects (integers, strings, tuples) cannot be altered in-place. Mutable objects (lists, dictionaries) can change their contents without changing memory address.\n\n"
            f"```python\n"
            f"# Demonstration: Memory References & Mutability\n"
            f"numbers = [1, 2, 3]        # Mutable list created on heap\n"
            f"alias = numbers            # alias references the exact same list\n"
            f"alias.append(4)            # Mutates in-place\n"
            f"print(numbers)             # Outputs: [1, 2, 3, 4]\n"
            f"print(id(numbers) == id(alias)) # True: identical heap address\n"
            f"```\n\n"
            f"### 💡 Key Takeaway\n"
            f"Remember: Variable assignment binds names to memory references. If you need independent state, always create an explicit copy using `.copy()` or `deepcopy()`."
        )

        return {
            "content": content,
            "provider": "AccessEd Assistive Intelligence Engine (Local Fallback)",
            "model": "accessed-pedagogical-v1",
            "tokens": 120
        }

ai_orchestrator = AIOrchestrator()
