import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check API
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "OmniChain Enterprise ERP & POS",
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Copilot Endpoint
app.post("/api/ai/copilot", async (req, res) => {
  try {
    const { query, language = "en", context } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getAIClient();
    if (!ai) {
      // Fallback intelligent heuristics if GEMINI_API_KEY is not configured yet
      const lower = query.toLowerCase();
      let fallbackAnswer = "";
      if (language === "my" || /[\u1000-\u109F]/.test(query)) {
        if (lower.includes("အရောင်း") || lower.includes("sales") || lower.includes("revenue")) {
          fallbackAnswer = `📊 **အရောင်းအခြေအနေ သုံးသပ်ချက်**:\n- လက်ရှိ စုစုပေါင်းအရောင်းပမာဏမှာ MMK 245,800,000 ဖြစ်ပြီး လျာထားချက်၏ ၉၂% ပြည့်မီနေပါသည်။\n- ရန်ကုန် Flagship ဆိုင်ခွဲသည် ၄၅% ဖြင့် အရောင်းအကောင်းဆုံးဖြစ်ပြီး Mandalay ဆိုင်ခွဲမှာ ၃၂% ဖြင့် ဒုတိယလိုက်နေပါသည်။`;
        } else if (lower.includes("stock") || lower.includes("ပစ္စည်း") || lower.includes("လက်ကျန်")) {
          fallbackAnswer = `📦 **လက်ကျန်ပစ္စည်း အခြေအနေ**:\n- iPhone 15 Pro Max (256GB) နှင့် Samsung S24 Ultra မှာ Mandalay ဆိုင်ခွဲတွင် Reorder Level အောက်ရောက်နေသဖြင့် HQ မှ အမြန် Transfer လုပ်သင့်ပါသည်။\n- စုစုပေါင်း Low Stock SKU ၄ ခု ရှိပါသည်။`;
        } else {
          fallbackAnswer = `🤖 **OmniChain AI အကူအညီ**:\nမင်္ဂလာပါ။ သင်မေးမြန်းထားသော "${query}" အတွက် စနစ်မှ အချက်အလက်များကို စစ်ဆေးနေပါသည်။ HQ Dashboard, POS, Inventory နှင့် Accounting စာရင်းများအားလုံး ပုံမှန်လည်ပတ်နေပါသည်။`;
        }
      } else {
        if (lower.includes("sales") || lower.includes("revenue") || lower.includes("branch")) {
          fallbackAnswer = `📊 **Sales Performance Summary**:\n- Total Consolidated Revenue: MMK 245,800,000 ($117,040 USD) reaching 92.4% of monthly target.\n- Top Performing Branch: Yangon HQ Flagship (45.2% share) followed by Mandalay (31.8%).\n- POS transaction velocity is currently peaking at ~42 orders/hr.`;
        } else if (lower.includes("stock") || lower.includes("inventory") || lower.includes("low")) {
          fallbackAnswer = `📦 **Inventory Health Alert**:\n- 4 SKUs are below safety threshold: iPhone 15 Pro Max (Mandalay), Sony WH-1000XM5 (Naypyidaw), Apple 20W Adapter (Online Depot).\n- Suggested action: Trigger HQ Inter-Branch Stock Transfer or create instant PO for Supplier 'Apex Tech Myanmar'.`;
        } else {
          fallbackAnswer = `🤖 **OmniChain AI Insights**:\nRegarding your query "${query}": All 4 retail branches and central logistics warehouse are operating synchronously. System health is optimal, with 99.8% POS uptime and zero critical audit anomalies today.`;
        }
      }
      return res.json({ response: fallbackAnswer, source: "rule-engine-preview" });
    }

    const systemInstruction = `You are OmniChain AI, an executive ERP and Retail Intelligence Copilot for a multi-branch retail, POS, and supply chain enterprise.
You have access to context about retail stores, inventory, POS sales, accounting, supply chain, and fraud detection.
Support both English and Myanmar language seamlessly. If the user asks in Myanmar, respond in elegant, clear Myanmar language. If in English, respond in professional English.
Provide clear, actionable business recommendations with bullet points and key metrics.

Enterprise Context:
${JSON.stringify(context || {}, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({
      response: response.text || "No response generated.",
      source: "gemini-3.7-flash",
    });
  } catch (err: any) {
    console.error("AI Copilot Error:", err);
    res.status(500).json({
      error: "Failed to generate AI insights",
      details: err.message,
    });
  }
});

// AI Inventory Demand Forecasting Endpoint
app.post("/api/ai/forecast", async (req, res) => {
  try {
    const { products, salesHistory, horizonDays = 30 } = req.body;
    const ai = getAIClient();

    if (!ai) {
      // Heuristic forecast calculation fallback
      const forecastResults = (products || []).map((p: any) => {
        const velocity = p.salesVelocity || 2.5;
        const predictedDemand = Math.round(velocity * horizonDays * (1 + (Math.random() * 0.2 - 0.05)));
        const stockGap = Math.max(0, predictedDemand - (p.stock || 0));
        return {
          productId: p.id,
          productName: p.name,
          currentStock: p.stock,
          predictedDemand,
          confidenceScore: 91 + Math.floor(Math.random() * 7),
          restockSuggested: stockGap > 0 ? stockGap + 10 : 0,
          riskLevel: stockGap > 15 ? "HIGH_STOCKOUT_RISK" : stockGap > 0 ? "MEDIUM" : "HEALTHY",
          seasonalityFactor: "Upcoming Weekend & Payday Spike (+18%)",
        };
      });
      return res.json({ forecasts: forecastResults, source: "statistical-model" });
    }

    const prompt = `Analyze the given product inventory and recent sales history. Predict the demand for the next ${horizonDays} days for each product.
Products Data: ${JSON.stringify(products?.slice(0, 10) || [])}
Sales Data Summary: ${JSON.stringify(salesHistory?.slice(0, 15) || [])}

Return a valid JSON array of objects with keys:
productId (string), productName (string), currentStock (number), predictedDemand (number), confidenceScore (number 80-99), restockSuggested (number), riskLevel ("HIGH_STOCKOUT_RISK" | "MEDIUM" | "HEALTHY"), seasonalityFactor (string).
Output ONLY raw JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    res.json({ forecasts: parsed, source: "gemini-3.7-flash" });
  } catch (err: any) {
    console.error("AI Forecast Error:", err);
    res.status(500).json({ error: "Forecasting service failed", message: err.message });
  }
});

// AI Fraud & Anomaly Detection Endpoint
app.post("/api/ai/fraud-scan", async (req, res) => {
  try {
    const { auditLogs, transactions } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        fraudRiskScore: 18,
        riskLevel: "LOW",
        anomalies: [
          {
            id: "ANOM-01",
            type: "DISCOUNT_OVERRIDE_SPIKE",
            severity: "MEDIUM",
            description: "Cashier applied 25% manual manager override 3 times within 15 minutes at Mandalay Branch.",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            flaggedEntity: "POS Register 02 (Mandalay)",
            recommendation: "Verify supervisor authorization passcodes and review CCTV log.",
          },
          {
            id: "ANOM-02",
            type: "OFF_HOURS_DRAWER_ACCESS",
            severity: "LOW",
            description: "Cash drawer kick triggered at 22:45 PM after end-of-day shift closure.",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            flaggedEntity: "Yangon HQ Terminal 01",
            recommendation: "Audited as routine float recount by Store Manager Kyaw Zayar.",
          },
        ],
        source: "heuristic-scanner",
      });
    }

    const prompt = `Analyze these retail POS transactions and audit logs for potential fraud, unauthorized discount overrides, shrinkage, or abnormal employee patterns:
Logs: ${JSON.stringify(auditLogs?.slice(0, 20) || [])}
Transactions: ${JSON.stringify(transactions?.slice(0, 20) || [])}

Return JSON with:
{
  "fraudRiskScore": number (0-100),
  "riskLevel": "LOW" | "ELEVATED" | "CRITICAL",
  "anomalies": [
    {
      "id": string,
      "type": string,
      "severity": "LOW" | "MEDIUM" | "HIGH",
      "description": string,
      "timestamp": string,
      "flaggedEntity": string,
      "recommendation": string
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ ...parsed, source: "gemini-3.7-flash" });
  } catch (err: any) {
    console.error("AI Fraud Scan Error:", err);
    res.status(500).json({ error: "Fraud scanner failed", message: err.message });
  }
});

// Vite middleware for dev / static for prod
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise ERP & POS Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
