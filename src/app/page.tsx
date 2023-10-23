"use client";
import Image from 'next/image';
import style from '#/styles/page.module.scss';
import { useState, useRef, useEffect, FormEvent, MutableRefObject } from 'react';

const luckyQuestions: string[] = [
    "What is a minimalist entrepreneur?",
    "What is your definition of community?",
    "How do I decide what kind of business I should start?"
];

export default function Home() {    
    const [isPending, setIsPending] = useState<boolean>(false);
    const [answer, setAnswer] = useState<string>();
    const [displayText, setDisplayText] = useState<string>("");
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const charIndex = useRef(-1);
    const cachedResponses = useRef<Map<string, string>>(new Map());

    // Destructure the form to extract the prompt from the
    // <textarea> element
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);
        const prompt = formData.get("prompt");

        if (prompt && !isPending) {
            setIsPending(true);
            const answer = await fetchResponse(prompt.toString());

            setIsPending(false);
            setDisplayText("");
            setAnswer(answer || "Doesn't look like I can answer that. Please try asking questions regarding the book");
        }
    }

    // Whenever the user submits a prompt, either get it from
    // the cache if it exists, or get it from the server 
    // and then cache it
    const fetchResponse = async (prompt: string) => {
        // Use the cache we the user has already asked this question
        if (cachedResponses.current.has(prompt.toLowerCase())) {
            return cachedResponses.current.get(prompt.toLowerCase());
        }

        const response = await fetch("/api/ask?" + new URLSearchParams({ prompt }));

        if (response.ok) {
            const { answer }: { answer: string } = await response.json();
            
            // Save this prompt and it's response on the cache
            cachedResponses.current.set(prompt.toLowerCase(), answer);
            return answer;
        }
    }

    // Create the typing effect
    useEffect(() => {
        // Ensure this useEffect does not run when the
        // server renders the page
        if (typeof window === 'undefined') { return; }
        if (!answer || answer.length <= 0) { return; }

        const interval = setInterval(() => {
            // Add the next character
            if (charIndex.current < answer.length) {
                charIndex.current += 1;
                setDisplayText(prevDisplayText => prevDisplayText + answer.charAt(charIndex.current));
            } else {
                clearInterval(interval);
            }
        }, 15);
        
        return () => clearInterval(interval); 
    }, [charIndex, answer]);

    return (
        <main id={style.main}>            
            <Image src="/book-cover.png" alt="book-cover" width={600} height={882} />
            <h1>Ask My Book</h1>
            <p>
                This is an experiment in using AI to make my book&apos;s content more
                accessible. Ask a question and AI&apos;ll answer it in real-time:
            </p>

            <form
                onSubmit={handleSubmit}
            >
                <textarea
                    name="prompt"
                    ref={textAreaRef}
                    disabled={isPending}
                    placeholder="What is The Minimalist Entrepreneur about?"
                />

                { (!answer || answer.length <= 0) &&
                    <div id={style.buttons}>
                        <button type="submit" disabled={isPending}>
                            { isPending ? "Loading..." : "Ask question" }
                        </button>
                        <button disabled={isPending}
                            onClick={(e) => {
                                if (!textAreaRef.current) { return; }

                                textAreaRef.current.value = luckyQuestions[Math.floor(Math.random() * luckyQuestions.length)];
                                console.log(textAreaRef.current.value);
                            }}
                        >
                            I&apos;m feeling lucky
                        </button>
                    </div>
                }
            </form>

            { answer && answer.length > 0 &&
                <div id={style.answerContainer}>
                    <div className={style.typeWriter}>
                        <p><span>Answer:&nbsp;</span>{displayText}</p>
                    </div>

                    { answer && answer.length === displayText.length &&
                        <button onClick={() => {
                            setAnswer("");
                            charIndex.current = -1;
                        }}>
                            Ask another question
                        </button>
                    }
                </div>
            }

            <footer>
                Project by <a href="https://twitter.com/shl">Sahil Lavingia</a>
                &nbsp;•&nbsp;
                <a href="https://github.com/BrianTib/askmybook">Forked</a> by <a href="https://github.com/BrianTib">Brian Tiburcio on GitHub</a>
            </footer>
        </main>
    )
}
