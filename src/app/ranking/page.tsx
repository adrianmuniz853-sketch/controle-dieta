"use client";

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Trophy, Medal, Crown, Star,
  Users, TrendingUp, Calendar, Target,
  Share2, Filter, Search, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

// Interface para participante
interface Participant {
  id: string;
  name: string;
  avatar: string;
  totalProtein: number;
  dailyGoal: number;
  daysActive: number;
  streak: number;
  avgDaily: number;
  lastActive: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Expert';
  achievements: string[];
}

// Interface para competição
interface Competition {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
  type: 'daily' | 'weekly' | 'monthly';
  goal: number;
  prize: string;
}

export default function RankingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  // Dados simulados de participantes
  const [participants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Ana Silva',
      avatar: '👩‍💼',
      totalProtein: 1250,
      dailyGoal: 100,
      daysActive: 12,
      streak: 8,
      avgDaily: 104.2,
      lastActive: '2024-01-21',
      level: 'Expert',
      achievements: ['🔥 Sequência de 7 dias', '🎯 Meta diária 10x', '💪 Proteína Master']
    },
    {
      id: '2',
      name: 'Carlos Santos',
      avatar: '👨‍💻',
      totalProtein: 1180,
      dailyGoal: 120,
      daysActive: 10,
      streak: 5,
      avgDaily: 118.0,
      lastActive: '2024-01-21',
      level: 'Avançado',
      achievements: ['🎯 Meta diária 5x', '📈 Crescimento constante']
    },
    {
      id: '3',
      name: 'Maria Oliveira',
      avatar: '👩‍🎓',
      totalProtein: 980,
      dailyGoal: 80,
      daysActive: 14,
      streak: 12,
      avgDaily: 70.0,
      lastActive: '2024-01-20',
      level: 'Intermediário',
      achievements: ['🔥 Sequência de 10 dias', '⭐ Consistência']
    },
    {
      id: '4',
      name: 'João Pereira',
      avatar: '👨‍🏫',
      totalProtein: 850,
      dailyGoal: 90,
      daysActive: 9,
      streak: 3,
      avgDaily: 94.4,
      lastActive: '2024-01-21',
      level: 'Intermediário',
      achievements: ['🎯 Meta diária 3x']
    },
    {
      id: '5',
      name: 'Lucia Costa',
      avatar: '👩‍⚕️',
      totalProtein: 720,
      dailyGoal: 70,
      daysActive: 11,
      streak: 6,
      avgDaily: 65.5,
      lastActive: '2024-01-19',
      level: 'Iniciante',
      achievements: ['🌟 Primeiro passo', '📊 Progresso steady']
    },
    {
      id: '6',
      name: 'Pedro Lima',
      avatar: '👨‍🔬',
      totalProtein: 1350,
      dailyGoal: 110,
      daysActive: 15,
      streak: 15,
      avgDaily: 90.0,
      lastActive: '2024-01-21',
      level: 'Expert',
      achievements: ['🔥 Sequência de 15 dias', '🏆 Líder mensal', '💎 Disciplina máxima']
    },
    {
      id: '7',
      name: 'Fernanda Rocha',
      avatar: '👩‍🎨',
      totalProtein: 640,
      dailyGoal: 85,
      daysActive: 8,
      streak: 2,
      avgDaily: 80.0,
      lastActive: '2024-01-21',
      level: 'Iniciante',
      achievements: ['🌱 Começando bem']
    },
    {
      id: '8',
      name: 'Ricardo Alves',
      avatar: '👨‍🍳',
      totalProtein: 1100,
      dailyGoal: 95,
      daysActive: 13,
      streak: 9,
      avgDaily: 84.6,
      lastActive: '2024-01-20',
      level: 'Avançado',
      achievements: ['🔥 Sequência de 9 dias', '🎯 Meta diária 7x', '📈 Top performer']
    }
  ]);

  // Competições ativas
  const [competitions] = useState<Competition[]>([
    {
      id: '1',
      name: 'Desafio Proteína Janeiro',
      description: 'Quem consegue manter a meta por mais dias consecutivos?',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      participants: participants,
      type: 'monthly',
      goal: 100,
      prize: '🏆 Troféu de Disciplina + Suplementos'
    },
    {
      id: '2',
      name: 'Sprint Semanal',
      description: 'Maior média de proteína da semana',
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      participants: participants.slice(0, 5),
      type: 'weekly',
      goal: 120,
      prize: '🥇 Medalha de Ouro + Shaker Premium'
    }
  ]);

  // Filtrar e ordenar participantes
  const filteredParticipants = participants
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = filterLevel === 'all' || p.level === filterLevel;
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      switch (selectedPeriod) {
        case 'daily':
          return b.avgDaily - a.avgDaily;
        case 'weekly':
          return b.totalProtein - a.totalProtein;
        case 'monthly':
          return b.streak - a.streak;
        default:
          return b.totalProtein - a.totalProtein;
      }
    });

  // Obter posição do participante
  const getPosition = (participantId: string) => {
    return filteredParticipants.findIndex(p => p.id === participantId) + 1;
  };

  // Obter ícone da posição
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{position}</span>;
    }
  };

  // Obter cor do nível
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-purple-500';
      case 'Avançado': return 'bg-blue-500';
      case 'Intermediário': return 'bg-green-500';
      case 'Iniciante': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Compartilhar ranking
  const shareRanking = () => {
    const shareText = `🏆 Ranking de Proteínas!\\n\\n🥇 1º lugar: ${filteredParticipants[0]?.name}\\n🥈 2º lugar: ${filteredParticipants[1]?.name}\\n🥉 3º lugar: ${filteredParticipants[2]?.name}\\n\\nVenha competir conosco! 💪`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Ranking de Proteínas',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Ranking copiado para a área de transferência!');
    }
  };

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
                  Ranking de Competições
                </h1>
                <p className="text-xs text-gray-500">Veja quem está dominando o desafio</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href="/graficos">
                <Button variant="outline" size="sm">
                  Gráficos
                </Button>
              </Link>
              <Link href="/tabela">
                <Button variant="outline" size="sm">
                  Tabela
                </Button>
              </Link>
              <Button
                onClick={shareRanking}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Ranking de Competições
          </h2>
          <p className="text-gray-600 mt-1">
            Acompanhe o desempenho de todos os participantes e veja quem está no topo!
          </p>
        </div>

        {/* Active Competitions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {competitions.map((competition) => (
            <Card key={competition.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  {competition.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{competition.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Participantes</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {competition.participants.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Meta</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {competition.goal}g/dia
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Período</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(competition.startDate).toLocaleDateString('pt-BR')} - {new Date(competition.endDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Prêmio</p>
                    <p className="font-semibold">{competition.prize}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="bg-white/60 backdrop-blur-sm border-emerald-100 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Period Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período de Ranking
                </label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="border-emerald-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Ranking Diário</SelectItem>
                    <SelectItem value="weekly">Ranking Semanal</SelectItem>
                    <SelectItem value="monthly">Ranking Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Participante
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Nome do participante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-emerald-200"
                  />
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Nível
                </label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="border-emerald-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Níveis</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                    <SelectItem value="Intermediário">Intermediário</SelectItem>
                    <SelectItem value="Iniciante">Iniciante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Podium - Top 3 */}
        {filteredParticipants.length >= 3 && (
          <Card className="bg-gradient-to-r from-yellow-50 via-white to-yellow-50 border-yellow-200 mb-8">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                Pódium dos Campeões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-center gap-8">
                {/* 2º Lugar */}
                <div className="text-center">
                  <div className="w-20 h-16 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg flex items-end justify-center mb-2">
                    <span className="text-4xl mb-2">{filteredParticipants[1]?.avatar}</span>
                  </div>
                  <Medal className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-bold text-gray-700">{filteredParticipants[1]?.name}</p>
                  <p className="text-sm text-gray-500">{filteredParticipants[1]?.totalProtein}g</p>
                  <Badge className={`${getLevelColor(filteredParticipants[1]?.level)} text-white text-xs mt-1`}>
                    {filteredParticipants[1]?.level}
                  </Badge>
                </div>

                {/* 1º Lugar */}
                <div className="text-center">
                  <div className="w-24 h-20 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex items-end justify-center mb-2">
                    <span className="text-5xl mb-2">{filteredParticipants[0]?.avatar}</span>
                  </div>
                  <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                  <p className="font-bold text-gray-800 text-lg">{filteredParticipants[0]?.name}</p>
                  <p className="text-sm text-gray-600 font-semibold">{filteredParticipants[0]?.totalProtein}g</p>
                  <Badge className={`${getLevelColor(filteredParticipants[0]?.level)} text-white text-xs mt-1`}>
                    {filteredParticipants[0]?.level}
                  </Badge>
                </div>

                {/* 3º Lugar */}
                <div className="text-center">
                  <div className="w-20 h-12 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg flex items-end justify-center mb-2">
                    <span className="text-4xl mb-1">{filteredParticipants[2]?.avatar}</span>
                  </div>
                  <Award className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="font-bold text-gray-700">{filteredParticipants[2]?.name}</p>
                  <p className="text-sm text-gray-500">{filteredParticipants[2]?.totalProtein}g</p>
                  <Badge className={`${getLevelColor(filteredParticipants[2]?.level)} text-white text-xs mt-1`}>
                    {filteredParticipants[2]?.level}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Ranking Table */}
        <Card className="bg-white/60 backdrop-blur-sm border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Ranking Completo - {selectedPeriod === 'daily' ? 'Média Diária' : selectedPeriod === 'weekly' ? 'Total Semanal' : 'Sequência Mensal'}
              </div>
              <Badge variant="outline">
                {filteredParticipants.length} participantes
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredParticipants.map((participant) => {
                const position = getPosition(participant.id);
                const progressPercentage = selectedPeriod === 'daily' 
                  ? (participant.avgDaily / participant.dailyGoal) * 100
                  : selectedPeriod === 'weekly'
                  ? (participant.totalProtein / (participant.dailyGoal * 7)) * 100
                  : (participant.streak / 30) * 100;

                return (
                  <div
                    key={participant.id}
                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      position <= 3 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Position */}
                      <div className="flex-shrink-0">
                        {getPositionIcon(position)}
                      </div>

                      {/* Avatar and Name */}
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">{participant.avatar}</span>
                        <div>
                          <h3 className="font-semibold text-gray-800">{participant.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${getLevelColor(participant.level)} text-white text-xs`}>
                              {participant.level}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Ativo há {participant.daysActive} dias
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">
                            {selectedPeriod === 'daily' ? 'Média Diária' : selectedPeriod === 'weekly' ? 'Total Semanal' : 'Sequência'}
                          </p>
                          <p className="text-xl font-bold text-emerald-600">
                            {selectedPeriod === 'daily' 
                              ? `${participant.avgDaily.toFixed(1)}g`
                              : selectedPeriod === 'weekly'
                              ? `${participant.totalProtein}g`
                              : `${participant.streak} dias`
                            }
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-gray-500">Meta Diária</p>
                          <p className="text-lg font-semibold text-gray-700">{participant.dailyGoal}g</p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-gray-500">Progresso</p>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={Math.min(progressPercentage, 100)} 
                              className="flex-1 h-2"
                            />
                            <span className="text-sm font-medium text-gray-600">
                              {Math.min(progressPercentage, 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Achievements */}
                      <div className="flex-shrink-0 max-w-xs">
                        <p className="text-xs text-gray-500 mb-1">Conquistas</p>
                        <div className="flex flex-wrap gap-1">
                          {participant.achievements.slice(0, 2).map((achievement, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {achievement}
                            </Badge>
                          ))}
                          {participant.achievements.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{participant.achievements.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredParticipants.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhum participante encontrado</p>
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}