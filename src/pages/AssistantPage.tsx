import { AppLayout } from "@/components/AppLayout";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Brain, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { shipments, alerts, carriers } from "@/data/mockData";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickQuestions = [
  "Which shipments are most likely to be delayed today?",
  "Which carrier is causing the highest risk this week?",
  "What route is most vulnerable right now?",
  "Show all critical shipments in customs hold",
  "What action should I take for the highest-risk alert?",
  "Summarize the current network health",
];

function generateResponse(q: string): string {
  const lower = q.toLowerCase();

  if (lower.includes('delayed') || lower.includes('delay')) {
    const delayed = [...shipments].sort((a, b) => b.predictedDelayHours - a.predictedDelayHours).slice(0, 5);
    return `Based on current predictions, the shipments most likely to be delayed are:\n\n${delayed.map(s => `• **${s.id}** (${s.cargo}): +${s.predictedDelayHours}h delay, ${s.disruptionProbability}% disruption probability. Cause: ${s.disruptionCause}. **Action:** ${s.recommendedAction.split(';')[0]}`).join('\n\n')}\n\nI recommend prioritizing SH-2415 and SH-2407 as they have the highest business impact.`;
  }

  if (lower.includes('carrier') || lower.includes('risk')) {
    const worst = [...carriers].sort((a, b) => a.performanceScore - b.performanceScore).slice(0, 3);
    return `The carriers contributing the highest risk this week:\n\n${worst.map(c => `• **${c.name}**: Performance score ${c.performanceScore}, ${c.incidentCount} incidents, avg delay ${c.avgDelay}h, trend: ${c.reliabilityTrend}`).join('\n\n')}\n\n**Recommendation:** Consider shifting future bookings from ${worst[0].name} to Hapag-Lloyd (score: 91) or Maersk Line (score: 87) for critical cargo.`;
  }

  if (lower.includes('route') || lower.includes('vulnerable')) {
    return `The most vulnerable routes right now:\n\n• **Asia-Europe via Suez**: Multiple congestion incidents, affecting SH-2404 and SH-2415. Risk elevated due to canal backlog.\n• **Asia-Americas (Pacific)**: SH-2407 facing carrier mechanical issues. $5.8M cargo at risk.\n• **South Asia-Middle East**: SH-2423 in Gulf of Aden with geopolitical risk.\n\n**Action:** Prioritize Suez-routed shipments for alternative routing assessment.`;
  }

  if (lower.includes('customs')) {
    const customs = shipments.filter(s => s.customsFlag);
    return `Shipments with active customs flags:\n\n${customs.map(s => `• **${s.id}** (${s.cargo}): Risk score ${s.riskScore}, at ${s.currentLocation}. ${s.disruptionCause}`).join('\n\n')}\n\nCritical action needed for SH-2407 (hazmat pre-clearance) and SH-2402 (FDA compliance documentation).`;
  }

  if (lower.includes('alert') || lower.includes('action')) {
    const critical = alerts.filter(a => a.severity === 'critical' && a.status === 'active')[0];
    if (critical) {
      return `The highest-priority active alert is:\n\n**${critical.title}**\nSeverity: Critical | Affected: ${critical.affectedShipments.join(', ')}\n\nBusiness Impact: ${critical.businessImpact}\n\n**Recommended Actions:**\n${critical.recommendedAction.split(';').map(a => `• ${a.trim()}`).join('\n')}\n\nI suggest taking immediate action on this to prevent downstream production impact.`;
    }
  }

  if (lower.includes('health') || lower.includes('summary') || lower.includes('status')) {
    const highRisk = shipments.filter(s => s.riskScore >= 50).length;
    const activeAlerts = alerts.filter(a => a.status === 'active').length;
    return `**Network Health Summary:**\n\n• **${shipments.length}** active shipments across 14 routes\n• **${highRisk}** shipments above risk threshold (score ≥ 50)\n• **${activeAlerts}** active alerts requiring attention\n• **${shipments.filter(s => s.status === 'delayed').length}** shipments currently delayed\n• Average predicted delay: ${Math.round(shipments.reduce((a, s) => a + s.predictedDelayHours, 0) / shipments.length)}h\n• Network health score: ${Math.round(100 - (highRisk / shipments.length) * 100)}%\n\n**Priority focus:** Battery cell shipment (SH-2407) and palm oil shipment (SH-2415) require immediate intervention.`;
  }

  return `I've analyzed your query across our supply chain data. Here's what I found:\n\n• **${shipments.length}** shipments currently being monitored\n• **${alerts.filter(a => a.status === 'active').length}** active disruption alerts\n• **${shipments.filter(s => s.riskScore >= 50).length}** high-risk shipments requiring attention\n\nCould you be more specific? Try asking about delays, carriers, routes, customs holds, or network health for detailed analysis.`;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your ResiliChain AI assistant. I can help you analyze shipment risks, identify delays, evaluate carrier performance, and recommend actions. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const response = generateResponse(text);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setTyping(false);
    }, 800 + Math.random() * 800);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-7rem)]">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            AI Assistant
          </h1>
          <p className="text-sm text-muted-foreground">Ask questions about your supply chain operations</p>
        </div>

        {/* Quick Questions */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {quickQuestions.map(q => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${m.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {m.role === 'assistant' ? <Brain className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              </div>
              <div className={`max-w-[75%] rounded-lg p-3 text-sm ${m.role === 'assistant' ? 'bg-card border border-border' : 'bg-primary text-primary-foreground'}`}>
                <div className="whitespace-pre-wrap text-xs leading-relaxed">
                  {m.content.split('**').map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                </div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-2.5">
              <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Brain className="h-3.5 w-3.5" />
              </div>
              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask about shipments, risks, carriers, routes..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            className="text-sm"
          />
          <Button size="sm" onClick={() => handleSend(input)} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
