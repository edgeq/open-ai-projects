import { openai } from "./openai.js"
import readline from 'node:readline'
// let's start by making a readline interface for processing terminal I/O
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})
// We also need to set up the ChatGPT system
// making sure to pass along the history/context of the chat
// along with the new message.
// Remember that our tokens compound after every request.
const newMessage = async (history, message) => {
    const results = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        // spread the history to keep context
        // lower temperature means less creative liberty
        temperature: 0.3,
    })
    // monitor usage
    console.log('usage', results.usage)
    return results.choices[0].message
}

const formatMessage = (userInput) => ({ role: 'user', content: userInput})

const chat = () => {
    const history = [
        {
            role: 'system', 
            content: 'You are a helpful assitant with deep knowledge about whatever you get asked. Do not make up answers, but be honest when you do not know something',
        }
    ]
    const start = () => {
        rl.question('You: ', async (userInput) => {
            if (userInput.toLowerCase() === 'exit') {
                rl.close()
                return
            }
            const userMessage = formatMessage(userInput)
            const response = await newMessage(history, userMessage)

            history.push(userMessage, response)
            console.log(`\n\nAI: ${response.content}\n\n`)
            start()
        })
    }
    start()
}
console.log('Chat initialized. Ask me a question. Type exit to quit')
chat()