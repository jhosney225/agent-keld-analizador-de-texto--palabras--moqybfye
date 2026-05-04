
```javascript
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function analyzeText(text) {
  console.log("\n🔍 Analizando texto con Claude...\n");

  const systemPrompt = `You are a text analysis expert. When given a text, you provide comprehensive analysis including:
1. Word count and unique words
2. Average word length
3. Sentence count and average sentence length
4. Most common words (top 10)
5. Readability metrics (flesch reading ease)
6. Key phrases and themes
7. Text complexity assessment
8. Suggestions for improvement

Format your response clearly with sections and bullet points.`;

  try {
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Please analyze the following text:\n\n"${text}"`,
        },
      ],
    });

    if (message.content[0].type === "text") {
      return message.content[0].text;
    }
  } catch (error) {
    throw new Error(`Error analyzing text: ${error.message}`);
  }
}

function performLocalAnalysis(text) {
  // Basic local analysis for demonstration
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim());

  const wordFreq = {};
  words.forEach((word) => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const totalChars = text.length;
  const charsSansSpaces = text.replace(/\s/g, "").length;
  const avgWordLength =
    words.length > 0
      ? (charsSansSpaces / words.length).toFixed(2)
      : "0.00";

  return {
    totalWords: words.length,
    uniqueWords: Object.keys(wordFreq).length,
    totalSentences: sentences.length,
    totalCharacters: totalChars,
    charactersSansSpaces: charsSansSpaces,
    averageWordLength: avgWordLength,
    averageSentenceLength: (words.length / sentences.length).toFixed(2),
    topWords: sortedWords.map(([word, count]) => `${word} (${count})`),
  };
}

async function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   Analizador Inteligente de Textos    ║");
  console.log("║        Powered by Claude AI            ║");
  console.log("╚════════════════════════════════════════╝\n");

  console.log("Opciones:");
  console.log("1. Analizar un texto corto");
  console.log("2. Analizar un párrafo largo");
  console.log("3. Salir\n");

  const choice = await question("Selecciona una opción (1-3): ");

  if (choice === "3") {
    console.log("\n👋 ¡Hasta luego!");
    rl.close();
    return;
  }

  let textToAnalyze;

  if (choice === "1") {
    textToAnalyze = await question(
      "\nEscribe un texto para analizar (máx 500 caracteres):\n> "
    );

    if (textToAnalyze.length > 500) {
      console.log("\n⚠️  Texto muy largo. Limitando a 500 caracteres...");
      textToAnalyze = textToAnalyze.substring(0, 500);
    }
  } else if (choice === "2") {
    textToAnalyze = `La inteligencia artificial ha revolucionado la forma en que vivimos y trabajamos. 
    Desde los asistentes virtuales hasta los sistemas de análisis de datos, la IA se ha convertido 
    en una parte integral de nuestras vidas. La tecnología de aprendizaje automático permite a las 
    máquinas aprender de los datos sin ser programadas explícitamente. Esto ha abierto nuevas 
    posibilidades en campos como la medicina, donde los algoritmos de IA pueden detectar enfermedades 
    antes que los médicos humanos. Sin embargo, también presenta desafíos éticos importantes que 
    la sociedad debe considerar cuidadosamente.`;

    console.log("\n📝 Analizando párrafo de ejemplo...");
  } else {
    console.log("\n❌ Opción no válida. Saliendo...");
    rl.close();
    return;
  }

  if (!textToAnalyze || textToAnalyze.trim().length === 0) {
    console.log("\n❌ El texto no puede estar vacío.");
    rl.close();
    return;
  }

  // Perform local analysis first
  console.log("\n📊 Análisis Local:\n");
  const localAnalysis = performLocalAnalysis(textToAnalyze);

  console.log(`Total de palabras: ${localAnalysis.totalWords}`);
  console.log(`Palabras únicas: ${localAnalysis.uniqueWords}`);
  console.log(`Número de oraciones: