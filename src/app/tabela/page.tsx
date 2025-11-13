"use client";

import { useState } from 'react';
import { 
  ArrowLeft, Calculator, Droplets, User, 
  TrendingUp, Info, Target, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function TabelaPage() {
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<string>('sedentario');
  const [climate, setClimate] = useState<string>('temperado');

  // Calcular necessidade de água
  const calculateWaterNeeds = () => {
    if (!weight || parseFloat(weight) <= 0) return null;
    
    const weightNum = parseFloat(weight);
    let baseWater = weightNum * 35; // 35ml por kg (base para adultos)
    
    // Ajustes por idade
    if (age) {
      const ageNum = parseInt(age);
      if (ageNum > 65) {
        baseWater *= 1.1; // Idosos precisam de mais água
      } else if (ageNum < 18) {
        baseWater *= 1.15; // Jovens precisam de mais água
      }
    }
    
    // Ajustes por atividade física
    switch (activityLevel) {
      case 'leve':
        baseWater *= 1.1;
        break;
      case 'moderado':
        baseWater *= 1.25;
        break;
      case 'intenso':
        baseWater *= 1.4;
        break;
      case 'muito_intenso':
        baseWater *= 1.6;
        break;
    }
    
    // Ajustes por clima
    switch (climate) {
      case 'quente':
        baseWater *= 1.15;
        break;
      case 'muito_quente':
        baseWater *= 1.3;
        break;
    }
    
    return Math.round(baseWater);
  };

  const waterNeeds = calculateWaterNeeds();
  const cupsNeeded = waterNeeds ? Math.ceil(waterNeeds / 250) : 0; // Copos de 250ml
  const bottlesNeeded = waterNeeds ? Math.ceil(waterNeeds / 500) : 0; // Garrafas de 500ml

  // Distribuição ao longo do dia
  const getHourlyDistribution = () => {
    if (!waterNeeds) return [];
    
    const wakeUpHour = 7;
    const sleepHour = 22;
    const activeHours = sleepHour - wakeUpHour;
    const hourlyAmount = Math.round(waterNeeds / activeHours);
    
    const distribution = [];
    for (let hour = wakeUpHour; hour <= sleepHour; hour++) {
      let amount = hourlyAmount;
      
      // Mais água pela manhã e menos à noite
      if (hour <= 10) amount = Math.round(hourlyAmount * 1.2);
      else if (hour >= 20) amount = Math.round(hourlyAmount * 0.7);
      
      distribution.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        amount: amount,
        description: getTimeDescription(hour)
      });
    }
    
    return distribution;
  };

  const getTimeDescription = (hour: number) => {
    if (hour <= 8) return 'Ao acordar';
    if (hour <= 10) return 'Manhã';
    if (hour <= 12) return 'Meio da manhã';
    if (hour <= 14) return 'Almoço';
    if (hour <= 16) return 'Tarde';
    if (hour <= 18) return 'Final da tarde';
    if (hour <= 20) return 'Jantar';
    return 'Noite';
  };

  const hourlyDistribution = getHourlyDistribution();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
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
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Calculadora de Água
                </h1>
                <p className="text-xs text-gray-500">Calcule sua necessidade diária de hidratação</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href="/graficos">
                <Button variant="outline" size="sm">
                  Gráficos
                </Button>
              </Link>
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
            <Droplets className="w-8 h-8 text-blue-600" />
            Calculadora de Água
          </h2>
          <p className="text-gray-600 mt-1">
            Descubra quanto de água você precisa beber por dia baseado no seu peso corporal
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculadora */}
          <div className="lg:col-span-1">
            <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Peso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso Corporal (kg) *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="number"
                      placeholder="Ex: 70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="pl-10 border-blue-200"
                      min="1"
                      max="300"
                    />
                  </div>
                </div>

                {/* Idade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idade (anos)
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 30"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="border-blue-200"
                    min="1"
                    max="120"
                  />
                </div>

                {/* Nível de Atividade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nível de Atividade Física
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full p-2 border border-blue-200 rounded-md bg-white"
                  >
                    <option value="sedentario">Sedentário</option>
                    <option value="leve">Atividade Leve</option>
                    <option value="moderado">Atividade Moderada</option>
                    <option value="intenso">Atividade Intensa</option>
                    <option value="muito_intenso">Muito Intenso</option>
                  </select>
                </div>

                {/* Clima */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clima da Região
                  </label>
                  <select
                    value={climate}
                    onChange={(e) => setClimate(e.target.value)}
                    className="w-full p-2 border border-blue-200 rounded-md bg-white"
                  >
                    <option value="frio">Frio</option>
                    <option value="temperado">Temperado</option>
                    <option value="quente">Quente</option>
                    <option value="muito_quente">Muito Quente</option>
                  </select>
                </div>

                {/* Informação */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium mb-1">Fórmula Base:</p>
                      <p>Peso × 35ml/kg para adultos</p>
                      <p className="mt-1">Ajustes aplicados conforme idade, atividade e clima.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-2 space-y-6">
            {waterNeeds ? (
              <>
                {/* Resultado Principal */}
                <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Droplets className="w-12 h-12 mx-auto mb-4 text-blue-100" />
                      <h3 className="text-2xl font-bold mb-2">Sua Meta Diária</h3>
                      <div className="text-5xl font-bold mb-2">{waterNeeds}ml</div>
                      <p className="text-blue-100">de água por dia</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-blue-400">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{cupsNeeded}</div>
                          <div className="text-sm text-blue-100">copos (250ml)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{bottlesNeeded}</div>
                          <div className="text-sm text-blue-100">garrafas (500ml)</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Distribuição Horária */}
                <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Distribuição Sugerida ao Longo do Dia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {hourlyDistribution.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100"
                        >
                          <div>
                            <div className="font-medium text-gray-800">{item.time}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                          <Badge variant="outline" className="bg-white">
                            {item.amount}ml
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Dicas */}
                <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Dicas para Manter a Hidratação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-gray-800">Comece o dia hidratado</p>
                            <p className="text-sm text-gray-600">Beba 1-2 copos de água ao acordar</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-gray-800">Use lembretes</p>
                            <p className="text-sm text-gray-600">Configure alarmes a cada 1-2 horas</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-gray-800">Tenha água sempre por perto</p>
                            <p className="text-sm text-gray-600">Mantenha uma garrafa visível</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-gray-800">Varie as fontes</p>
                            <p className="text-sm text-gray-600">Chás, água com limão, água de coco</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-gray-800">Monitore a cor da urina</p>
                            <p className="text-sm text-gray-600">Deve estar clara ou amarelo claro</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-gray-800">Aumente em dias quentes</p>
                            <p className="text-sm text-gray-600">Ou durante exercícios intensos</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
                <CardContent className="p-12 text-center">
                  <Droplets className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">
                    Insira seu peso para calcular
                  </h3>
                  <p className="text-gray-500">
                    Digite seu peso corporal para descobrir quanto de água você precisa beber por dia
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}