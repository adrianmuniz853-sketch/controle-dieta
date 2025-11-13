"use client";

import { useState, useEffect } from 'react';
import { 
  Calendar, BarChart3, TrendingUp, Target,
  ArrowLeft, Trophy, Users, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Interface para dados de disciplina
interface DisciplineData {
  day: string;
  protein: number;
  goal: number;
  date: string;
}

// Interface para dados mensais
interface MonthlyData {
  month: string;
  avgProtein: number;
  daysGoalMet: number;
  totalDays: number;
}

// Interface para histórico de anotações
interface ProteinEntry {
  id: string;
  date: string;
  protein: number;
  goal: number;
  notes?: string;
}

export default function GraficosPage() {
  const [dailyGoal] = useState(100);
  const [disciplineData, setDisciplineData] = useState<DisciplineData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [proteinHistory, setProteinHistory] = useState<ProteinEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar dados do localStorage
  const loadStoredData = (): ProteinEntry[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('proteinHistory');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return [];
    }
  };

  // Salvar dados no localStorage
  const saveToStorage = (data: ProteinEntry[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('proteinHistory', JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  // Gerar dados realistas dos últimos 7 dias baseado no histórico
  const generateWeeklyData = (history: ProteinEntry[]): DisciplineData[] => {
    const today = new Date();
    const weekData: DisciplineData[] = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Procurar entrada real no histórico
      const historyEntry = history.find(entry => entry.date === dateStr);
      
      let protein: number;
      if (historyEntry) {
        protein = historyEntry.protein;
      } else {
        // Simular variação realista de proteína (70-130g) com seed baseado na data
        const seed = date.getTime() % 1000000;
        const baseProtein = 85 + (seed % 45);
        protein = Math.round(baseProtein);
      }
      
      weekData.push({
        day: dayNames[date.getDay()],
        protein: protein,
        goal: dailyGoal,
        date: dateStr
      });
    }
    
    return weekData;
  };

  // Gerar dados dos últimos 6 meses baseado no histórico
  const generateMonthlyData = (history: ProteinEntry[]): MonthlyData[] => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const today = new Date();
    const monthlyData: MonthlyData[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      
      // Se é o mês atual, usar apenas os dias que já passaram
      const totalDays = i === 0 ? today.getDate() : daysInMonth;
      
      // Filtrar entradas do histórico para este mês
      const monthEntries = history.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === monthIndex && entryDate.getFullYear() === year;
      });
      
      let avgProtein: number;
      let daysGoalMet: number;
      
      if (monthEntries.length > 0) {
        // Usar dados reais do histórico
        avgProtein = Math.round(monthEntries.reduce((sum, entry) => sum + entry.protein, 0) / monthEntries.length);
        daysGoalMet = monthEntries.filter(entry => entry.protein >= entry.goal).length;
      } else {
        // Simular dados realistas com seed baseado no mês
        const seed = date.getTime() % 1000000;
        avgProtein = Math.round(80 + (seed % 40));
        const successRate = 0.6 + ((seed % 30) / 100); // 60-90% de sucesso
        daysGoalMet = Math.round(totalDays * successRate);
      }
      
      monthlyData.push({
        month: monthNames[monthIndex],
        avgProtein: avgProtein,
        daysGoalMet: daysGoalMet,
        totalDays: totalDays
      });
    }
    
    return monthlyData;
  };

  // Adicionar nova entrada de proteína
  const addProteinEntry = (protein: number, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: ProteinEntry = {
      id: Date.now().toString(),
      date: today,
      protein: protein,
      goal: dailyGoal,
      notes: notes
    };

    const updatedHistory = [...proteinHistory];
    
    // Verificar se já existe entrada para hoje
    const existingIndex = updatedHistory.findIndex(entry => entry.date === today);
    
    if (existingIndex >= 0) {
      // Atualizar entrada existente
      updatedHistory[existingIndex] = { ...updatedHistory[existingIndex], protein, notes };
    } else {
      // Adicionar nova entrada
      updatedHistory.push(newEntry);
    }
    
    // Manter apenas os últimos 180 dias (6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
    const filteredHistory = updatedHistory.filter(entry => 
      new Date(entry.date) >= sixMonthsAgo
    );
    
    setProteinHistory(filteredHistory);
    saveToStorage(filteredHistory);
    
    // Regenerar dados dos gráficos
    const weeklyData = generateWeeklyData(filteredHistory);
    const monthlyDataGenerated = generateMonthlyData(filteredHistory);
    
    setDisciplineData(weeklyData);
    setMonthlyData(monthlyDataGenerated);
  };

  // Carregar dados no cliente para evitar problemas de hidratação
  useEffect(() => {
    const history = loadStoredData();
    setProteinHistory(history);
    
    const weeklyData = generateWeeklyData(history);
    const monthlyDataGenerated = generateMonthlyData(history);
    
    setDisciplineData(weeklyData);
    setMonthlyData(monthlyDataGenerated);
    setIsLoading(false);
  }, [dailyGoal]);

  // Mostrar loading enquanto os dados não são gerados
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando gráficos...</p>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const weeklyAverage = disciplineData.reduce((sum, day) => sum + day.protein, 0) / disciplineData.length;
  const daysGoalMet = disciplineData.filter(day => day.protein >= day.goal).length;
  const consistencyRate = (daysGoalMet / disciplineData.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Análise de Proteínas
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href="/ranking">
                <Button variant="outline" size="sm">
                  Ranking
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-600" />
            Análise Gráfica de Performance
          </h2>
          <p className="text-gray-600 mt-1">
            Acompanhe sua evolução e identifique padrões no seu consumo de proteínas
          </p>
          <div className="mt-2 text-sm text-gray-500">
            📊 Histórico salvo: {proteinHistory.length} registros • 
            💾 Dados salvos automaticamente no seu navegador
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Média Semanal</p>
                  <p className="text-3xl font-bold">{weeklyAverage.toFixed(1)}g</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Meta Diária</p>
                  <p className="text-3xl font-bold">{dailyGoal}g</p>
                </div>
                <Target className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Dias com Meta</p>
                  <p className="text-3xl font-bold">{daysGoalMet}/7</p>
                </div>
                <Trophy className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm">Consistência</p>
                  <p className="text-3xl font-bold">{consistencyRate.toFixed(0)}%</p>
                </div>
                <Star className="w-8 h-8 text-cyan-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Chart */}
        <Card className="bg-white/60 backdrop-blur-sm border-emerald-100 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Gráfico Semanal - Últimos 7 Dias
            </CardTitle>
            <p className="text-sm text-gray-600">
              Consumo diário de proteínas com meta de {dailyGoal}g
              {proteinHistory.length > 0 && (
                <span className="ml-2 text-emerald-600">
                  • {proteinHistory.filter(entry => {
                    const entryDate = new Date(entry.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return entryDate >= weekAgo;
                  }).length} registros reais esta semana
                </span>
              )}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-end justify-between gap-2 sm:gap-4 p-4 bg-gradient-to-t from-gray-50 to-transparent rounded-lg relative">
              {/* SVG Line Chart */}
              <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)]" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Goal line */}
                <line 
                  x1="0" 
                  y1={100 - (dailyGoal / Math.max(...disciplineData.map(d => d.protein), dailyGoal) * 100)} 
                  x2="100" 
                  y2={100 - (dailyGoal / Math.max(...disciplineData.map(d => d.protein), dailyGoal) * 100)} 
                  stroke="#9CA3AF" 
                  strokeWidth="0.5" 
                  strokeDasharray="2,2" 
                  opacity="0.7"
                />
                
                {/* Protein line */}
                <polyline
                  fill="none"
                  stroke="url(#proteinGradient)"
                  strokeWidth="1"
                  points={disciplineData.map((day, index) => {
                    const maxValue = Math.max(...disciplineData.map(d => d.protein), dailyGoal);
                    const x = (index / (disciplineData.length - 1)) * 100;
                    const y = 100 - (day.protein / maxValue * 100);
                    return `${x},${y}`;
                  }).join(' ')}
                />
                
                {/* Data points */}
                {disciplineData.map((day, index) => {
                  const maxValue = Math.max(...disciplineData.map(d => d.protein), dailyGoal);
                  const x = (index / (disciplineData.length - 1)) * 100;
                  const y = 100 - (day.protein / maxValue * 100);
                  const isGoalMet = day.protein >= day.goal;
                  const hasRealData = proteinHistory.some(entry => entry.date === day.date);
                  
                  return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={y}
                        r="1.5"
                        fill={isGoalMet ? "#10B981" : "#EF4444"}
                        stroke="white"
                        strokeWidth="0.5"
                        className="hover:r-2 transition-all cursor-pointer"
                      />
                      {hasRealData && (
                        <circle
                          cx={x}
                          cy={y}
                          r="2.5"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="0.5"
                          opacity="0.6"
                        />
                      )}
                    </g>
                  );
                })}
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="proteinGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Data labels and info */}
              {disciplineData.map((day, index) => {
                const isGoalMet = day.protein >= day.goal;
                const hasRealData = proteinHistory.some(entry => entry.date === day.date);
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1 relative z-10">
                    {/* Value label */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-sm border opacity-0 hover:opacity-100 transition-opacity">
                      {day.protein}g
                      {hasRealData && <span className="text-blue-500 ml-1">●</span>}
                    </div>
                    
                    <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1 mt-auto">{day.day}</div>
                    <div className="text-xs text-gray-500 mb-1">Meta: {day.goal}g</div>
                    <Badge 
                      variant={isGoalMet ? "default" : "destructive"} 
                      className="text-xs"
                    >
                      {isGoalMet ? "✓ Atingida" : `✗ -${day.goal - day.protein}g`}
                    </Badge>
                  </div>
                );
              })}
            </div>
            
            {/* Chart Legend */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded"></div>
                <span>Meta Atingida ({daysGoalMet} dias)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-t from-red-500 to-red-300 rounded"></div>
                <span>Meta Não Atingida ({7 - daysGoalMet} dias)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 border-t-2 border-dashed border-gray-400"></div>
                <span>Linha da Meta ({dailyGoal}g)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Dados Reais</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend Chart */}
        <Card className="bg-white/60 backdrop-blur-sm border-emerald-100 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Tendência Mensal - Últimos 6 Meses
            </CardTitle>
            <p className="text-sm text-gray-600">
              Média mensal de proteínas e taxa de sucesso
              {proteinHistory.length > 0 && (
                <span className="ml-2 text-blue-600">
                  • Baseado em {proteinHistory.length} registros salvos
                </span>
              )}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-end justify-between gap-3 sm:gap-6 p-4 bg-gradient-to-t from-blue-50 to-transparent rounded-lg">
              {monthlyData.map((month, index) => {
                const maxAvg = Math.max(...monthlyData.map(m => m.avgProtein));
                const height = Math.max((month.avgProtein / maxAvg) * 100, 15);
                const successRate = (month.daysGoalMet / month.totalDays) * 100;
                const isCurrentMonth = index === monthlyData.length - 1;
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1 relative">
                    <div className="relative w-full max-w-16 sm:max-w-20 mb-2">
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-700 hover:scale-105 cursor-pointer shadow-lg ${
                          isCurrentMonth 
                            ? 'bg-gradient-to-t from-purple-600 via-purple-500 to-purple-400' 
                            : 'bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400'
                        }`}
                        style={{ height: `${height}%`, minHeight: '25px' }}
                        title={`${month.month}: Média de ${month.avgProtein}g`}
                      ></div>
                      
                      {/* Value label */}
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded shadow-sm border">
                        {month.avgProtein}g
                      </div>
                      
                      {/* Current month indicator */}
                      {isCurrentMonth && (
                        <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                          <Star className="w-3 h-3 text-yellow-400 drop-shadow-sm" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      {month.month}
                      {isCurrentMonth && <span className="text-purple-600 ml-1">*</span>}
                    </div>
                    <div className="text-xs text-gray-500 text-center mb-1">
                      {month.daysGoalMet}/{month.totalDays} dias
                    </div>
                    <Badge 
                      variant={
                        successRate >= 80 ? "default" : 
                        successRate >= 60 ? "secondary" : 
                        "destructive"
                      } 
                      className="text-xs"
                    >
                      {successRate.toFixed(0)}%
                    </Badge>
                  </div>
                );
              })}
            </div>
            
            {/* Monthly Chart Info */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {(monthlyData.reduce((sum, m) => sum + m.avgProtein, 0) / monthlyData.length).toFixed(1)}g
                  </p>
                  <p className="text-sm text-gray-600">Média Geral (6 meses)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-600">
                    {monthlyData.reduce((sum, m) => sum + m.daysGoalMet, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total de Dias com Meta</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {((monthlyData.reduce((sum, m) => sum + m.daysGoalMet, 0) / 
                       monthlyData.reduce((sum, m) => sum + m.totalDays, 0)) * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-600">Taxa de Sucesso Geral</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  * Mês atual (dados parciais até hoje) • 
                  💾 Dados salvos localmente: {proteinHistory.length} registros
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        <Card className="bg-white/60 backdrop-blur-sm border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Análise de Performance Detalhada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Analysis */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Análise Semanal
                </h3>
                
                <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-emerald-800">Melhor Performance</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>{disciplineData.reduce((best, day) => day.protein > best.protein ? day : best).day}</strong> - {' '}
                    {Math.max(...disciplineData.map(d => d.protein))}g de proteína
                    <br />
                    <span className="text-emerald-600">
                      +{Math.max(...disciplineData.map(d => d.protein)) - dailyGoal}g acima da meta
                    </span>
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-orange-800">Oportunidade de Melhoria</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>{disciplineData.reduce((worst, day) => day.protein < worst.protein ? day : worst).day}</strong> - {' '}
                    {Math.min(...disciplineData.map(d => d.protein))}g de proteína
                    <br />
                    <span className="text-orange-600">
                      {Math.min(...disciplineData.map(d => d.protein)) < dailyGoal 
                        ? `${dailyGoal - Math.min(...disciplineData.map(d => d.protein))}g abaixo da meta`
                        : 'Meta atingida'
                      }
                    </span>
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Avaliação de Consistência</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>
                      {consistencyRate >= 80 ? 'Excelente!' : 
                       consistencyRate >= 60 ? 'Muito Boa!' : 
                       consistencyRate >= 40 ? 'Boa!' : 'Precisa melhorar'}
                    </strong> {' '}
                    ({consistencyRate.toFixed(0)}% dos dias com meta atingida)
                    <br />
                    <span className="text-blue-600">
                      Déficit total da semana: {disciplineData.reduce((sum, day) => 
                        sum + Math.max(0, dailyGoal - day.protein), 0)}g
                    </span>
                  </p>
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Tendências Mensais
                </h3>
                
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">Melhor Mês</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>{monthlyData.reduce((best, month) => month.avgProtein > best.avgProtein ? month : best).month}</strong> - {' '}
                    {Math.max(...monthlyData.map(m => m.avgProtein))}g de média
                    <br />
                    <span className="text-purple-600">
                      {((monthlyData.find(m => m.avgProtein === Math.max(...monthlyData.map(m => m.avgProtein)))?.daysGoalMet || 0) / 
                        (monthlyData.find(m => m.avgProtein === Math.max(...monthlyData.map(m => m.avgProtein)))?.totalDays || 1) * 100).toFixed(0)}% de sucesso
                    </span>
                  </p>
                </div>

                <div className="p-4 bg-cyan-50 rounded-lg border-l-4 border-cyan-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-cyan-600" />
                    <span className="font-medium text-cyan-800">Evolução Recente</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {monthlyData[monthlyData.length - 1].avgProtein > monthlyData[monthlyData.length - 2].avgProtein 
                      ? '📈 Tendência positiva!' 
                      : '📉 Oportunidade de melhoria'} {' '}
                    <br />
                    <span className="text-cyan-600">
                      {monthlyData[monthlyData.length - 1].avgProtein > monthlyData[monthlyData.length - 2].avgProtein 
                        ? `+${(monthlyData[monthlyData.length - 1].avgProtein - monthlyData[monthlyData.length - 2].avgProtein).toFixed(1)}g vs mês anterior`
                        : `${(monthlyData[monthlyData.length - 1].avgProtein - monthlyData[monthlyData.length - 2].avgProtein).toFixed(1)}g vs mês anterior`
                      }
                    </span>
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Disciplina Geral</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>
                      {((monthlyData.reduce((sum, m) => sum + m.daysGoalMet, 0) / 
                         monthlyData.reduce((sum, m) => sum + m.totalDays, 0)) * 100).toFixed(0)}%
                    </strong> de sucesso nos últimos 6 meses
                    <br />
                    <span className="text-green-600">
                      {monthlyData.reduce((sum, m) => sum + m.daysGoalMet, 0)} dias com meta atingida de {monthlyData.reduce((sum, m) => sum + m.totalDays, 0)} dias totais
                    </span>
                  </p>
                </div>

                {/* Histórico de Dados */}
                <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-indigo-800">Histórico Salvo</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>{proteinHistory.length}</strong> registros salvos automaticamente
                    <br />
                    <span className="text-indigo-600">
                      {proteinHistory.length > 0 
                        ? `Primeiro registro: ${new Date(proteinHistory[0]?.date || '').toLocaleDateString('pt-BR')}`
                        : 'Nenhum registro salvo ainda'
                      }
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}