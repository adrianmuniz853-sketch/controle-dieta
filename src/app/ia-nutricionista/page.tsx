"use client";

import { useState, useEffect } from 'react';
import { 
  Bot, MessageCircle, Send, X, Settings, 
  User, Target, Calendar, TrendingUp,
  Apple, Beef, Coffee, Utensils, Clock,
  Save, Edit, ArrowLeft, Home
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

// Interface para mensagem da IA
interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// Interface para configurações da IA
interface AISettings {
  responseStyle: 'formal' | 'casual' | 'technical';
  focusArea: 'general' | 'protein' | 'weight_loss' | 'muscle_gain' | 'sports';
  detailLevel: 'basic' | 'intermediate' | 'advanced';
  language: 'pt' | 'en';
  personalizedTips: boolean;
  nutritionGoals: {
    dailyProtein: number;
    dailyCalories: number;
    mealsPerDay: number;
  };
}

// Interface para perfil do usuário
interface UserProfile {
  name: string;
  age: string;
  weight: string;
  height: string;
  goal: string;
  activityLevel: string;
  dietaryRestrictions: string;
  allergies: string;
}

export default function IANutricionista() {
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'settings' | 'profile'>('chat');
  
  // Estados para configurações da IA
  const [aiSettings, setAiSettings] = useState<AISettings>({
    responseStyle: 'casual',
    focusArea: 'general',
    detailLevel: 'intermediate',
    language: 'pt',
    personalizedTips: true,
    nutritionGoals: {
      dailyProtein: 100,
      dailyCalories: 2000,
      mealsPerDay: 5
    }
  });

  // Estados para perfil do usuário
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    age: '',
    weight: '',
    height: '',
    goal: '',
    activityLevel: 'moderate',
    dietaryRestrictions: '',
    allergies: ''
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Base de conhecimento da IA de Nutricionismo
  const nutritionKnowledge = {
    proteins: {
      daily_needs: {
        sedentary: '0.8g por kg de peso corporal',
        active: '1.2-1.6g por kg de peso corporal',
        athlete: '1.6-2.2g por kg de peso corporal'
      },
      sources: {
        animal: ['Frango', 'Peixe', 'Ovos', 'Carne vermelha', 'Laticínios'],
        plant: ['Feijão', 'Lentilha', 'Quinoa', 'Tofu', 'Amendoim', 'Chia']
      },
      timing: 'Distribua ao longo do dia, 20-30g por refeição para melhor absorção'
    },
    supplements: {
      whey: 'Absorção rápida, ideal pós-treino',
      casein: 'Absorção lenta, ideal antes de dormir',
      creatine: '3-5g diários, melhora performance',
      bcaa: 'Útil em jejum ou treinos longos'
    },
    meal_planning: {
      breakfast: 'Inclua proteína para saciedade (ovos, iogurte grego)',
      lunch: 'Combine proteína + carboidrato + vegetais',
      dinner: 'Proteína magra + vegetais + gordura boa',
      snacks: 'Castanhas, frutas com pasta de amendoim'
    },
    tips: [
      'Beba água suficiente para metabolizar proteínas',
      'Combine proteínas completas e incompletas',
      'Não exceda 40g de proteína por refeição',
      'Inclua vegetais em todas as refeições',
      'Planeje suas refeições com antecedência'
    ]
  };

  // Carregar dados do localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('aiNutri_messages');
    if (savedMessages) {
      const messages = JSON.parse(savedMessages);
      setAiMessages(messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    } else {
      // Mensagem inicial da IA
      setAiMessages([{
        id: '1',
        type: 'ai',
        content: 'Olá! Sou sua assistente de nutricionismo personalizada. Agora posso te ajudar de forma ainda mais específica com dicas sobre proteínas, planejamento de refeições, suplementação e muito mais! Configure suas preferências nas configurações para uma experiência personalizada. Como posso ajudar você hoje?',
        timestamp: new Date()
      }]);
    }

    const savedSettings = localStorage.getItem('aiNutri_settings');
    if (savedSettings) {
      setAiSettings(JSON.parse(savedSettings));
    }

    const savedProfile = localStorage.getItem('aiNutri_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('aiNutri_messages', JSON.stringify(aiMessages));
  }, [aiMessages]);

  useEffect(() => {
    localStorage.setItem('aiNutri_settings', JSON.stringify(aiSettings));
  }, [aiSettings]);

  useEffect(() => {
    localStorage.setItem('aiNutri_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Função para processar pergunta da IA com personalização
  const processAIQuestion = (question: string): string => {
    const q = question.toLowerCase();
    const style = aiSettings.responseStyle;
    const focus = aiSettings.focusArea;
    const level = aiSettings.detailLevel;
    
    // Personalização baseada no perfil
    let personalizedContext = '';
    if (aiSettings.personalizedTips && userProfile.name) {
      personalizedContext = `${userProfile.name}, `;
    }
    
    // Ajustar tom da resposta
    const greeting = style === 'formal' ? 'Prezado(a)' : style === 'casual' ? 'Oi' : 'Olá';
    const ending = style === 'formal' ? 'Espero ter ajudado!' : style === 'casual' ? 'Espero que ajude! 😊' : 'Consulte sempre um profissional para orientações específicas.';
    
    // Proteínas
    if (q.includes('proteína') || q.includes('protein')) {
      if (q.includes('quanto') || q.includes('quantidade')) {
        let response = `${greeting} ${personalizedContext}para calcular sua necessidade de proteína:\n\n`;
        
        if (level === 'basic') {
          response += `• Pessoa sedentária: ${nutritionKnowledge.proteins.daily_needs.sedentary}\n`;
          response += `• Pessoa ativa: ${nutritionKnowledge.proteins.daily_needs.active}\n`;
        } else {
          response += `• Sedentário: ${nutritionKnowledge.proteins.daily_needs.sedentary}\n`;
          response += `• Ativo: ${nutritionKnowledge.proteins.daily_needs.active}\n`;
          response += `• Atleta: ${nutritionKnowledge.proteins.daily_needs.athlete}\n\n`;
          response += `${nutritionKnowledge.proteins.timing}`;
        }
        
        // Personalização baseada no peso do usuário
        if (userProfile.weight && aiSettings.personalizedTips) {
          const weight = parseFloat(userProfile.weight);
          const proteinNeeded = weight * (userProfile.activityLevel === 'sedentary' ? 0.8 : 
                                         userProfile.activityLevel === 'active' ? 1.4 : 1.2);
          response += `\n\n💡 Para você especificamente: aproximadamente ${proteinNeeded.toFixed(0)}g de proteína por dia.`;
        }
        
        return response + `\n\n${ending}`;
      }
      
      if (q.includes('fonte') || q.includes('alimento')) {
        let response = `${greeting} ${personalizedContext}excelentes fontes de proteína:\n\n`;
        response += `🥩 Animais: ${nutritionKnowledge.proteins.sources.animal.join(', ')}\n\n`;
        response += `🌱 Vegetais: ${nutritionKnowledge.proteins.sources.plant.join(', ')}\n\n`;
        
        if (level !== 'basic') {
          response += `Dica: Combine diferentes fontes para obter todos os aminoácidos essenciais!`;
        }
        
        return response + `\n\n${ending}`;
      }
    }
    
    // Suplementos
    if (q.includes('suplemento') || q.includes('whey') || q.includes('creatina')) {
      let response = `${greeting} ${personalizedContext}principais suplementos:\n\n`;
      response += `💪 Whey Protein: ${nutritionKnowledge.supplements.whey}\n`;
      response += `🌙 Caseína: ${nutritionKnowledge.supplements.casein}\n`;
      response += `⚡ Creatina: ${nutritionKnowledge.supplements.creatine}\n`;
      response += `🔋 BCAA: ${nutritionKnowledge.supplements.bcaa}\n\n`;
      
      if (level !== 'basic') {
        response += `Lembre-se: suplementos complementam, não substituem uma boa alimentação!`;
      }
      
      return response + `\n\n${ending}`;
    }
    
    // Planejamento de refeições
    if (q.includes('refeição') || q.includes('cardápio') || q.includes('dieta')) {
      let response = `${greeting} ${personalizedContext}planejamento de refeições:\n\n`;
      response += `🌅 Café da manhã: ${nutritionKnowledge.meal_planning.breakfast}\n`;
      response += `🍽️ Almoço: ${nutritionKnowledge.meal_planning.lunch}\n`;
      response += `🌆 Jantar: ${nutritionKnowledge.meal_planning.dinner}\n`;
      response += `🥜 Lanches: ${nutritionKnowledge.meal_planning.snacks}\n\n`;
      
      if (level !== 'basic') {
        response += `Dica: Prepare as refeições com antecedência para manter a consistência!`;
      }
      
      // Personalização baseada no objetivo
      if (userProfile.goal && aiSettings.personalizedTips) {
        response += `\n\n💡 Para seu objetivo (${userProfile.goal}), foque em refeições balanceadas e consistência.`;
      }
      
      return response + `\n\n${ending}`;
    }
    
    // Dicas gerais
    if (q.includes('dica') || q.includes('conselho') || q.includes('ajuda')) {
      const randomTip = nutritionKnowledge.tips[Math.floor(Math.random() * nutritionKnowledge.tips.length)];
      let response = `${greeting} ${personalizedContext}💡 Dica importante: ${randomTip}\n\n`;
      
      if (level !== 'basic') {
        response += `Outras dicas valiosas:\n`;
        response += nutritionKnowledge.tips.filter(tip => tip !== randomTip).slice(0, 3).map(tip => `• ${tip}`).join('\n');
      }
      
      return response + `\n\n${ending}`;
    }
    
    // Resposta padrão personalizada
    let response = `${greeting} ${personalizedContext}posso te ajudar com:\n\n`;
    response += `🥩 Necessidades de proteína\n`;
    response += `💊 Suplementação\n`;
    response += `🍽️ Planejamento de refeições\n`;
    response += `💡 Dicas de nutrição\n`;
    response += `📊 Análise do seu progresso\n\n`;
    response += `Faça uma pergunta específica sobre qualquer um desses temas!`;
    
    return response + `\n\n${ending}`;
  };

  // Enviar mensagem para IA
  const sendMessageToAI = async () => {
    if (!userInput.trim()) return;
    
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setAiMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsAITyping(true);
    
    // Simular delay de processamento baseado no nível de detalhe
    const delay = aiSettings.detailLevel === 'advanced' ? 2000 : 
                  aiSettings.detailLevel === 'intermediate' ? 1500 : 1000;
    
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: processAIQuestion(userInput),
        timestamp: new Date()
      };
      
      setAiMessages(prev => [...prev, aiResponse]);
      setIsAITyping(false);
    }, delay);
  };

  // Salvar perfil do usuário
  const saveUserProfile = () => {
    setIsEditingProfile(false);
  };

  // Limpar conversa
  const clearConversation = () => {
    setAiMessages([{
      id: '1',
      type: 'ai',
      content: 'Conversa limpa! Como posso ajudar você hoje?',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-emerald-100 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <Home className="w-4 h-4" />
                  Voltar
                </Button>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
                    IA Nutricionista
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sua assistente personalizada de nutrição</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={currentView === 'chat' ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView('chat')}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </Button>
              <Button
                variant={currentView === 'profile' ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView('profile')}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Perfil
              </Button>
              <Button
                variant={currentView === 'settings' ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView('settings')}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'chat' ? (
          // CHAT DA IA
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Principal */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-6 h-6" />
                      IA Nutricionista
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {aiSettings.responseStyle === 'formal' ? 'Formal' : 
                         aiSettings.responseStyle === 'casual' ? 'Casual' : 'Técnico'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearConversation}
                      className="text-white hover:bg-white/20"
                    >
                      Limpar Chat
                    </Button>
                  </CardTitle>
                  <p className="text-emerald-100 text-sm">
                    Assistente especializada em nutrição e proteínas - Configurada para {aiSettings.focusArea === 'general' ? 'orientações gerais' : 
                    aiSettings.focusArea === 'protein' ? 'foco em proteínas' : 
                    aiSettings.focusArea === 'weight_loss' ? 'perda de peso' : 
                    aiSettings.focusArea === 'muscle_gain' ? 'ganho de massa' : 'performance esportiva'}
                  </p>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {aiMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {message.type === 'ai' && (
                            <div className="flex items-center gap-2 mb-2">
                              <Bot className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-medium text-emerald-600">IA Nutricionista</span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isAITyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-600">IA Nutricionista</span>
                          </div>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Input Area */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Pergunte sobre proteínas, suplementos, dietas..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessageToAI();
                          }
                        }}
                        className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                        rows={1}
                      />
                      <Button
                        onClick={sendMessageToAI}
                        disabled={!userInput.trim() || isAITyping}
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Quanto de proteína preciso?', 'Melhores fontes de proteína', 'Dicas de suplementação', 'Planejamento de refeições'].map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => setUserInput(suggestion)}
                          className="text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar com Resumo */}
            <div className="space-y-6">
              {/* Status da IA */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="w-5 h-5 text-emerald-500" />
                    Status da IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estilo:</span>
                    <span className="text-sm font-medium capitalize">{aiSettings.responseStyle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Foco:</span>
                    <span className="text-sm font-medium">
                      {aiSettings.focusArea === 'general' ? 'Geral' : 
                       aiSettings.focusArea === 'protein' ? 'Proteínas' : 
                       aiSettings.focusArea === 'weight_loss' ? 'Perda de Peso' : 
                       aiSettings.focusArea === 'muscle_gain' ? 'Ganho de Massa' : 'Esportes'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Nível:</span>
                    <span className="text-sm font-medium capitalize">{aiSettings.detailLevel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Personalizado:</span>
                    <span className="text-sm font-medium">{aiSettings.personalizedTips ? 'Sim' : 'Não'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Metas Nutricionais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Suas Metas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Proteína Diária:</span>
                    <span className="text-sm font-medium">{aiSettings.nutritionGoals.dailyProtein}g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Calorias Diárias:</span>
                    <span className="text-sm font-medium">{aiSettings.nutritionGoals.dailyCalories} kcal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Refeições/Dia:</span>
                    <span className="text-sm font-medium">{aiSettings.nutritionGoals.mealsPerDay}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas do Chat */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Mensagens Hoje:</span>
                    <span className="text-sm font-medium">{aiMessages.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Última Conversa:</span>
                    <span className="text-sm font-medium">
                      {aiMessages.length > 0 ? 'Agora' : 'Nunca'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : currentView === 'profile' ? (
          // PERFIL DO USUÁRIO
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                  <User className="w-8 h-8 text-emerald-500" />
                  Perfil do Usuário
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  Configure suas informações para respostas mais personalizadas
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {isEditingProfile ? 'Cancelar' : 'Editar'}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditingProfile}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="age">Idade</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={userProfile.age}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, age: e.target.value }))}
                        disabled={!isEditingProfile}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="70"
                        value={userProfile.weight}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, weight: e.target.value }))}
                        disabled={!isEditingProfile}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="175"
                        value={userProfile.height}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, height: e.target.value }))}
                        disabled={!isEditingProfile}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="goal">Objetivo Principal</Label>
                    <Input
                      id="goal"
                      placeholder="Ex: Ganhar massa muscular, perder peso, manter forma..."
                      value={userProfile.goal}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, goal: e.target.value }))}
                      disabled={!isEditingProfile}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="activityLevel">Nível de Atividade</Label>
                    <Select 
                      value={userProfile.activityLevel} 
                      onValueChange={(value) => setUserProfile(prev => ({ ...prev, activityLevel: value }))}
                      disabled={!isEditingProfile}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentário</SelectItem>
                        <SelectItem value="light">Leve</SelectItem>
                        <SelectItem value="moderate">Moderado</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="very_active">Muito Ativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isEditingProfile && (
                    <Button
                      onClick={saveUserProfile}
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Perfil
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Restrições e Alergias */}
              <Card>
                <CardHeader>
                  <CardTitle>Restrições Alimentares</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="dietaryRestrictions">Restrições Dietéticas</Label>
                    <Textarea
                      id="dietaryRestrictions"
                      placeholder="Ex: Vegetariano, vegano, sem glúten, sem lactose..."
                      value={userProfile.dietaryRestrictions}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                      disabled={!isEditingProfile}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="allergies">Alergias Alimentares</Label>
                    <Textarea
                      id="allergies"
                      placeholder="Ex: Amendoim, frutos do mar, ovos..."
                      value={userProfile.allergies}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, allergies: e.target.value }))}
                      disabled={!isEditingProfile}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  {/* Resumo do Perfil */}
                  {userProfile.name && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Resumo do Perfil:</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        <p><strong>Nome:</strong> {userProfile.name}</p>
                        {userProfile.age && <p><strong>Idade:</strong> {userProfile.age} anos</p>}
                        {userProfile.weight && userProfile.height && (
                          <p><strong>IMC:</strong> {(parseFloat(userProfile.weight) / Math.pow(parseFloat(userProfile.height) / 100, 2)).toFixed(1)}</p>
                        )}
                        {userProfile.goal && <p><strong>Objetivo:</strong> {userProfile.goal}</p>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // CONFIGURAÇÕES DA IA
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                  <Settings className="w-8 h-8 text-emerald-500" />
                  Configurações da IA
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  Personalize como a IA Nutricionista interage com você
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Configurações de Personalidade */}
              <Card>
                <CardHeader>
                  <CardTitle>Personalidade da IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Estilo de Resposta</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Como você prefere que a IA se comunique com você?
                    </p>
                    <Select 
                      value={aiSettings.responseStyle} 
                      onValueChange={(value: 'formal' | 'casual' | 'technical') => 
                        setAiSettings(prev => ({ ...prev, responseStyle: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal - Respeitoso e profissional</SelectItem>
                        <SelectItem value="casual">Casual - Amigável e descontraído</SelectItem>
                        <SelectItem value="technical">Técnico - Científico e detalhado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Área de Foco</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Em que área você quer que a IA seja especialista?
                    </p>
                    <Select 
                      value={aiSettings.focusArea} 
                      onValueChange={(value: 'general' | 'protein' | 'weight_loss' | 'muscle_gain' | 'sports') => 
                        setAiSettings(prev => ({ ...prev, focusArea: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Geral - Nutrição completa</SelectItem>
                        <SelectItem value="protein">Proteínas - Foco em proteínas</SelectItem>
                        <SelectItem value="weight_loss">Perda de Peso - Emagrecimento</SelectItem>
                        <SelectItem value="muscle_gain">Ganho de Massa - Hipertrofia</SelectItem>
                        <SelectItem value="sports">Esportes - Performance atlética</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Nível de Detalhe</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Quão detalhadas você quer que sejam as respostas?
                    </p>
                    <Select 
                      value={aiSettings.detailLevel} 
                      onValueChange={(value: 'basic' | 'intermediate' | 'advanced') => 
                        setAiSettings(prev => ({ ...prev, detailLevel: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Básico - Respostas simples</SelectItem>
                        <SelectItem value="intermediate">Intermediário - Equilibrado</SelectItem>
                        <SelectItem value="advanced">Avançado - Muito detalhado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Dicas Personalizadas</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Usar informações do seu perfil nas respostas
                      </p>
                    </div>
                    <Button
                      variant={aiSettings.personalizedTips ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAiSettings(prev => ({ ...prev, personalizedTips: !prev.personalizedTips }))}
                    >
                      {aiSettings.personalizedTips ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Metas Nutricionais */}
              <Card>
                <CardHeader>
                  <CardTitle>Metas Nutricionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="dailyProtein">Meta Diária de Proteína (g)</Label>
                    <Input
                      id="dailyProtein"
                      type="number"
                      value={aiSettings.nutritionGoals.dailyProtein}
                      onChange={(e) => setAiSettings(prev => ({
                        ...prev,
                        nutritionGoals: { ...prev.nutritionGoals, dailyProtein: Number(e.target.value) }
                      }))}
                      className="mt-1"
                      min="50"
                      max="300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dailyCalories">Meta Diária de Calorias (kcal)</Label>
                    <Input
                      id="dailyCalories"
                      type="number"
                      value={aiSettings.nutritionGoals.dailyCalories}
                      onChange={(e) => setAiSettings(prev => ({
                        ...prev,
                        nutritionGoals: { ...prev.nutritionGoals, dailyCalories: Number(e.target.value) }
                      }))}
                      className="mt-1"
                      min="1200"
                      max="4000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mealsPerDay">Refeições por Dia</Label>
                    <Select 
                      value={aiSettings.nutritionGoals.mealsPerDay.toString()} 
                      onValueChange={(value) => setAiSettings(prev => ({
                        ...prev,
                        nutritionGoals: { ...prev.nutritionGoals, mealsPerDay: Number(value) }
                      }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 refeições</SelectItem>
                        <SelectItem value="4">4 refeições</SelectItem>
                        <SelectItem value="5">5 refeições</SelectItem>
                        <SelectItem value="6">6 refeições</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preview das Configurações */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Preview das Configurações:</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <p><strong>Estilo:</strong> {aiSettings.responseStyle === 'formal' ? 'Formal e profissional' : 
                                                   aiSettings.responseStyle === 'casual' ? 'Casual e amigável' : 'Técnico e científico'}</p>
                      <p><strong>Foco:</strong> {aiSettings.focusArea === 'general' ? 'Nutrição geral' : 
                                                 aiSettings.focusArea === 'protein' ? 'Especialista em proteínas' : 
                                                 aiSettings.focusArea === 'weight_loss' ? 'Perda de peso' : 
                                                 aiSettings.focusArea === 'muscle_gain' ? 'Ganho de massa muscular' : 'Performance esportiva'}</p>
                      <p><strong>Detalhamento:</strong> {aiSettings.detailLevel === 'basic' ? 'Respostas simples' : 
                                                         aiSettings.detailLevel === 'intermediate' ? 'Nível intermediário' : 'Muito detalhado'}</p>
                      <p><strong>Personalização:</strong> {aiSettings.personalizedTips ? 'Ativada' : 'Desativada'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}