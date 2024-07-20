import 'dotenv/config'
import OpenAI from 'openai'
// OPENAI_API_KEY environment variable cannot be missing or empty
// If it is, you can set one up in .env or instantiate 
// the OpenAI client with an apiKey option, like new OpenAI({ apiKey: 'My API Key' })."
const openai = new OpenAI()

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