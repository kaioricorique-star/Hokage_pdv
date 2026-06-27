import { useState } from \"react\";
import { api } from \"../lib/api\";
import PageHeader from \"../components/PageHeader\";
import { Sparkles, Loader2 } from \"lucide-react\";

const PRESETS = [
  { label: \"Sugestões para o cardápio\", context: \"menu\", prompt: \"Analise meu cardápio e sugira 3 novos itens que combinem com a operação, com preço estimado e justificativa.\" },
  { label: \"Análise de vendas\", context: \"sales\", prompt: \"Analise minhas vendas recentes e me dê 3 insights práticos para aumentar o faturamento esta semana.\" },
  { label: \"Combos para aumentar ticket\", context: \"menu\", prompt: \"Sugira 3 combos rentáveis usando produtos atuais, com nome, composição e preço promocional sugerido.\" },
  { label: \"Reduzir desperdício\", context: \"general\", prompt: \"Quais são as melhores práticas para reduzir desperdício em um restaurante delivery?\" },
];

export default function IA() {
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [context, setContext] = useState(PRESETS[0].context);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(\"\");

  const run = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setResponse(\"\");
    try {
      const { data } = await api.post(\"/ia/insights\", { prompt, context });
      setResponse(data.response);
    } catch (e) {
      setResponse(\"Erro ao consultar IA: \" + (e.response?.data?.detail || e.message));
    } finally { setLoading(false); }
  };

  return (
    <div data-testid=\"ia-page\">
      <PageHeader subtitle=\"Inteligência operacional\" title=\"IA Insights\" actions={<span className=\"text-xs text-neutral-500 flex items-center gap-1\"><Sparkles className=\"w-3 h-3\" />Claude Sonnet 4.6</span>} />
      <div className=\"p-8 grid lg:grid-cols-3 gap-4\">
        <div className=\"bg-white border border-neutral-200 p-4 space-y-3\">
          <p className=\"overline\">Templates rápidos</p>
          <div className=\"space-y-2\" data-testid=\"ia-presets\">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => { setPrompt(p.prompt); setContext(p.context); }}
                className=\"w-full text-left p-3 border border-neutral-200 hover:border-neutral-900 transition-colors text-sm\"
                data-testid={`preset-${i}`}>
                <p className=\"font-semibold\">{p.label}</p>
                <p className=\"text-xs text-neutral-500 mt-1 line-clamp-2\">{p.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        <div className=\"lg:col-span-2 bg-white border border-neutral-200 p-4\">
          <p className=\"overline mb-2\">Sua pergunta</p>
          <select value={context} onChange={(e) => setContext(e.target.value)} className=\"w-full px-3 py-2 border border-neutral-300 mb-2 text-sm\" data-testid=\"ia-context\">
            <option value=\"menu\">Contexto: Cardápio</option>
            <option value=\"sales\">Contexto: Vendas</option>
            <option value=\"general\">Contexto: Geral</option>
          </select>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
            className=\"w-full px-3 py-2 border border-neutral-300 focus:border-neutral-900 focus:outline-none text-sm\"
            data-testid=\"ia-prompt\" placeholder=\"Pergunte qualquer coisa sobre seu negócio…\" />
          <button onClick={run} disabled={loading} className=\"mt-3 bg-red-600 text-white px-4 py-2.5 font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2\" data-testid=\"ia-submit\">
            {loading ? <Loader2 className=\"w-4 h-4 animate-spin\" /> : <Sparkles className=\"w-4 h-4\" />}
            {loading ? \"Pensando…\" : \"Gerar Insights\"}
          </button>

          {response && (
            <div className=\"mt-5 p-4 bg-neutral-50 border border-neutral-200 whitespace-pre-wrap text-sm leading-relaxed\" data-testid=\"ia-response\">
              {response}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/IA.jsx