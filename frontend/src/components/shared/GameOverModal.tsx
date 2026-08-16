import { useGameStore } from '@/store/gameStore';
import { createPortal } from 'react-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, AlertOctagon, RotateCcw, ArrowRight, BarChart2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export const GameOverModal = () => {
  const state = useGameStore((s) => s.state);
  const company = useGameStore((s) => s.company);
  const actions = useGameStore((s) => s.actions);
  const navigate = useNavigate();

  if (!state.isGameOver) return null;

  const isVictory = state.gameResult === 'victory';

  const handleRestart = () => {
    actions.resetGame();
    navigate('/');
  };

  const handleDownloadReport = async () => {
    const createDivider = () => new Paragraph({ text: "---", alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } });
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: "🚀 AI STARTUP SIMULATION", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: "FINAL EXECUTIVE REPORT", heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
          createDivider(),
          
          new Paragraph({ text: "🏢 COMPANY PROFILE", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({
            children: [
              new TextRun({ text: "Company Name: ", bold: true }),
              new TextRun({ text: company?.name || 'Company', bold: true }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Simulation Status: ", bold: true }),
              new TextRun({ text: isVictory ? "🏆 VICTORY" : "💀 BANKRUPTCY", bold: true }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Simulation Duration: ", bold: true }),
              new TextRun({ text: `2025 → ${state.currentYear} (Q${state.currentQuarter})`, bold: true }),
            ]
          }),
          createDivider(),

          new Paragraph({ text: "📊 FINAL PERFORMANCE METRICS", heading: HeadingLevel.HEADING_1 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Metric", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Final Value", bold: true })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("💰 Final Budget")] }),
                  new TableCell({ children: [new Paragraph({ text: `$${state.budget.toLocaleString()}`, bold: true })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("📈 Final ROI")] }),
                  new TableCell({ children: [new Paragraph({ text: `${state.roi}%`, bold: true })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("👥 Employees")] }),
                  new TableCell({ children: [new Paragraph({ text: `${state.employees}`, bold: true })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("😊 Employee Morale")] }),
                  new TableCell({ children: [new Paragraph({ text: `${state.morale}%`, bold: true })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("⭐ Company Level")] }),
                  new TableCell({ children: [new Paragraph({ text: `${state.level}`, bold: true })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("💎 Estimated Valuation")] }),
                  new TableCell({ children: [new Paragraph({ text: `$${(state.valuation || 0).toLocaleString()}`, bold: true })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("📅 Final Quarter")] }),
                  new TableCell({ children: [new Paragraph({ text: `${state.currentYear} - Q${state.currentQuarter}`, bold: true })] }),
                ]
              })
            ]
          }),
          createDivider(),

          new Paragraph({ text: "🎯 EXECUTIVE SUMMARY", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: isVictory 
            ? `Over the course of the simulation, the company successfully expanded its operations through strategic AI investments and operational decisions. The organization achieved an estimated valuation of $${(state.valuation || 0).toLocaleString()} while maintaining an employee morale of ${state.morale}%.`  
            : "The simulation concluded in corporate failure. Operations ceased due to critical insolvency, failing to maintain the necessary capital reserves or operational ROI to sustain market presence." 
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: isVictory
            ? "The Board recognizes this simulation as a Victory, demonstrating strong long-term business sustainability and successful AI-driven transformation."
            : "The Board recognizes this simulation as a Bankruptcy, highlighting critical failures in resource management and strategic adaptation.",
          }),
          createDivider(),

          new Paragraph({ text: "📜 COMPANY HISTORY LOG", heading: HeadingLevel.HEADING_1 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Year", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Quarter", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Revenue", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Budget", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "ROI", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Morale", bold: true })] }),
                ]
              }),
              ...state.history.map((h) => 
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(`${h.year}`)] }),
                    new TableCell({ children: [new Paragraph(`Q${h.quarter || 1}`)] }),
                    new TableCell({ children: [new Paragraph(`$${(h.revenue || 0).toLocaleString()}`)] }),
                    new TableCell({ children: [new Paragraph(`$${h.budget.toLocaleString()}`)] }),
                    new TableCell({ children: [new Paragraph(`${h.roi}%`)] }),
                    new TableCell({ children: [new Paragraph(`${h.morale}%`)] }),
                  ]
                })
              )
            ]
          }),
          createDivider(),
          
          new Paragraph({ text: "🏅 BOARD VERDICT", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({
            children: [
              new TextRun({ text: "Simulation Result: ", bold: true }),
              new TextRun({ text: isVictory ? "🏆 VICTORY" : "💀 BANKRUPTCY", bold: true })
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: isVictory
            ? "Your leadership successfully transformed a startup into a thriving AI-driven enterprise through strategic investments, workforce development, and operational expansion."
            : "Your leadership failed to maintain the required capital thresholds and market competitiveness, leading to corporate dissolution."
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: isVictory 
                ? "\"The Board of Directors congratulates you on building a resilient AI enterprise capable of competing in the future economy.\""
                : "\"The Board of Directors terminates your position effective immediately. Please clear your desk.\"", bold: true })
            ]
          }),
          createDivider(),
          new Paragraph({ text: "Generated by AI Startup Simulator • Executive Board Report", alignment: AlignmentType.CENTER, italics: true }),
        ],
      }],
    });
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${company?.name || 'Company'}_Final_Report.docx`);
    });
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      {/* Background neon pulse glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${
        isVictory ? 'bg-yellow-500/10 animate-pulse' : 'bg-rose-500/10 animate-pulse'
      }`} />

      {/* Cyber ambient scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

      <Card className={`max-w-xl w-full cyber-glass relative shadow-2xl overflow-hidden ${
        isVictory 
          ? 'cyber-border-gold shadow-[0_0_50px_rgba(234,179,8,0.2)]' 
          : 'cyber-border-magenta shadow-[0_0_50px_rgba(244,63,94,0.2)]'
      }`}>
        {/* Dynamic flashing top edge line */}
        <div className={`absolute inset-x-0 top-0 h-[3px] ${
          isVictory ? 'bg-gradient-to-r from-transparent via-yellow-400 to-transparent' : 'bg-gradient-to-r from-transparent via-rose-500 to-transparent'
        }`} />

        <CardContent className="p-8 text-center space-y-6 relative z-10">
          {isVictory ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-md animate-ping" />
                <Trophy className="h-20 w-20 text-yellow-400 mx-auto drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" />
              </div>
              <h1 className="text-4xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-orange-400 text-glow-gold">
                🎉 VICTORY ACHIEVED!
              </h1>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed font-space">
                Outstanding strategic leadership! You successfully scaled <span className="text-yellow-400 font-bold font-orbitron">{company?.name.toUpperCase()}</span> and navigated the corporation safely into the target milestone of <span className="text-cyan-400 font-bold font-orbitron">Year 2035</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-md animate-pulse" />
                <AlertOctagon className="h-20 w-20 text-rose-500 mx-auto drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
              </div>
              <h1 className="text-4xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-400 to-red-600 text-glow-magenta">
                💸 DEBT BANKRUPTCY
              </h1>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed font-space">
                Critical financial depletion! <span className="text-rose-400 font-bold font-orbitron">{company?.name.toUpperCase()}</span> has exhausted all operating capital reserves and filed for bankruptcy in <span className="text-rose-500 font-bold font-orbitron">Year {state.currentYear} // Quarter Q{state.currentQuarter}</span>.
              </p>
            </div>
          )}

          {/* Vitals summary HUD grid */}
          <div className="grid grid-cols-4 gap-2 pt-4 font-orbitron">
            
            <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-900 flex flex-col justify-center">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest block">VALUATION</span>
              <p className={`text-xs font-bold mt-1 ${isVictory ? 'text-yellow-400' : 'text-slate-400'}`}>
                ${(state.valuation || 0).toLocaleString()}
              </p>
            </div>

            <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-900 flex flex-col justify-center">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest block">BUDGET</span>
              <p className={`text-xs font-bold mt-1 ${isVictory ? 'text-green-400' : 'text-rose-400'}`}>
                ${state.budget.toLocaleString()}
              </p>
            </div>

            <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-900 flex flex-col justify-center">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest block">FINAL ROI</span>
              <p className="text-xs font-bold text-cyan-400 mt-1">
                {state.roi}%
              </p>
            </div>

            <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-900 flex flex-col justify-center">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest block">EMPLOYEES</span>
              <p className="text-xs font-bold text-purple-400 mt-1">
                {state.employees}
              </p>
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 w-full justify-center">

            <Button
              onClick={handleDownloadReport}
              className="py-3 px-4 font-orbitron font-bold text-[10px] sm:text-xs tracking-wider bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              <Download className="h-4 w-4" />
              DOWNLOAD REPORT .DOCX
            </Button>

            <Button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                }
                navigate('/outcome');
              }}
              className={`py-3 px-4 font-orbitron font-black text-[10px] sm:text-xs tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all ${
                isVictory 
                  ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.3)]' 
                  : 'bg-rose-500 text-slate-950 hover:bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
              }`}
            >
              <BarChart2 className="h-4 w-4" />
              VIEW ANALYTICS GRAPH
              <ArrowRight className="h-4 w-4" />
            </Button>

          </div>
        </CardContent>
      </Card>
    </div>
  );

  const container = document.fullscreenElement || document.body;
  return createPortal(modalContent, container);
};
