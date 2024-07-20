import { OpenAI } from 'openai'
import 'dotenv/config'

const openai = new OpenAI({
    // Usually from bashrc or zshrc
    // but using dotenv
    // apiKey: process.env.OPENAI_PROJECT_KEY,
    project: process.env.$OPENAI_PROJECT_KEY,
})

async function main() {
    const completion = await openai.chat.completions.create({
        messages: [{
            role: 'system',
            content: 'You are a helpful assistant'
        }],
        model: 'gpt-4o-mini',
    })
    console.log(completion);
    console.log('----');
    console.log(completion.choices);
    console.log('----');
    console.log(completion.choices[0]);
}

main()