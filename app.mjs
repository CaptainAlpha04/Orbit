import express from 'express'
import OpenAI from 'openai'
import path from 'path'

const app = express()
const port = 5000

const openai = new OpenAI({
    organization: 'org-JbDDShx15snJaavwnGXH5LUa',
    apiKey: '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',
  });
  
  async function getChatCompletion(p) {
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [{ role: "user", content: p}],
      stream: true,
    });
  
    let result = "";
  
    for await (const chunk of stream) {
      result += chunk.choices[0]?.delta?.content || "";
    }
  
    return result;
  }
  
app.use(express.static(path.join('', 'public')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'index.html'));
  });


app.get('/quote', async (req, res) => {
    
    const topic = "Failure"
    const p = `You are a wise and helpful quote generator. your goal is to give quotes of the greatest people who ever lived as well as anonymous people. Please give only single quote at a time. give quotes on ${topic}. the quotes should be unique and new everytime`;
    try {
      const quote = await getChatCompletion(p);
      res.json({quote});
      console.log(quote)
    } catch (error) {
      console.error('Error getting quote:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`listening on port ${port}...`)
})
  