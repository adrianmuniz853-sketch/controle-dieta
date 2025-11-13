"use client";

import { useState, useEffect } from 'react';
import { 
  Heart, Star, Filter, ChevronDown, 
  Apple, Beef, Fish, Wheat, Milk, Egg,
  Info, Bookmark, BookmarkCheck, X, Users,
  Share2, Trophy, TrendingUp, Calendar,
  Plus, Minus, BarChart3, Target, Clock,
  Coffee, Utensils, Bot, MessageCircle, Send,
  Menu, Home, FileText, Calculator, Award,
  Settings, User, Moon, Sun, Save, Edit, Palette
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

// Interface para alimentos
interface Food {
  id: string;
  name: string;
  category: string;
  protein: number;
  calories: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

// Interface para consumo diário
interface DailyConsumption {
  date: string;
  foods: { foodId: string; quantity: number; }[];
  totalProtein: number;
  goalMet: boolean;
}

// Interface para competição
interface Competition {
  id: string;
  name: string;
  participants: string[];
  startDate: string;
  endDate: string;
  goal: number; // meta de proteína diária
}

// Interface para anotações de consumo
interface ConsumptionNote {
  id: string;
  foodName: string;
  quantity: number;
  unit: string;
  timestamp: string;
  category: 'food' | 'drink';
  notes?: string;
}

// Interface para mensagem da IA
interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// Interface para perfil do usuário
interface UserProfile {
  name: string;
  email: string;
  age: string;
  weight: string;
  height: string;
  goal: string;
  activityLevel: string;
}

// Interface para esquema de cores
interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  gradient: string;
  description: string;
}

// Lista de alimentos comuns para autocomplete
const commonFoods = [
  'Arroz', 'Arroz Integral', 'Aveia', 'Abacate', 'Abacaxi', 'Amêndoas', 'Atum', 'Açaí',
  'Banana', 'Batata', 'Batata-doce', 'Brócolis', 'Bife', 'Bacalhau', 'Berinjela',
  'Café', 'Cenoura', 'Couve', 'Couve-flor', 'Clara de Ovo', 'Carne', 'Coxão Mole', 'Castanha',
  'Feijão', 'Frango', 'Filé de Frango', 'Frutas', 'Farinha', 'Fígado',
  'Grão-de-bico', 'Granola', 'Goiaba',
  'Iogurte', 'Inhame',
  'Leite', 'Lentilha', 'Laranja', 'Limão',
  'Maçã', 'Mamão', 'Mandioca', 'Massa', 'Milho', 'Morango', 'Músculo',
  'Nozes', 'Noz',
  'Ovo', 'Ovos', 'Oleo de Oliva',
  'Pão', 'Pão Integral', 'Peito de Frango', 'Peixe', 'Peru', 'Pasta de Amendoim', 'Pera',
  'Queijo', 'Quinoa',
  'Ricota', 'Rúcula',
  'Salmão', 'Sardinha', 'Soja', 'Suco', 'Salada',
  'Tilápia', 'Tomate', 'Tofu',
  'Uva',
  'Verduras', 'Vitamina',
  'Whey Protein', 'Water'
];

// Esquemas de cores disponíveis
const colorSchemes: ColorScheme[] = [
  {
    id: 'emerald-blue',
    name: 'Esmeralda & Azul',
    primary: 'emerald-500',
    secondary: 'blue-500',
    gradient: 'from-emerald-500 to-blue-500',
    description: 'Esquema padrão'
  },
  {
    id: 'purple-pink',
    name: 'Roxo & Rosa',
    primary: 'purple-500',
    secondary: 'pink-500',
    gradient: 'from-purple-500 to-pink-500',
    description: 'Combinação vibrante de roxo e rosa'
  },
  {
    id: 'orange-red',
    name: 'Laranja & Vermelho',
    primary: 'orange-500',
    secondary: 'red-500',
    gradient: 'from-orange-500 to-red-500',
    description: 'Tons quentes de laranja e vermelho'
  },
  {
    id: 'cyan-teal',
    name: 'Ciano & Verde-azulado',
    primary: 'cyan-500',
    secondary: 'teal-500',
    gradient: 'from-cyan-500 to-teal-500',
    description: 'Cores refrescantes do oceano'
  },
  {
    id: 'yellow-orange',
    name: 'Amarelo & Laranja',
    primary: 'yellow-500',
    secondary: 'orange-500',
    gradient: 'from-yellow-500 to-orange-500',
    description: 'Cores solares e energéticas'
  },
  {
    id: 'indigo-purple',
    name: 'Índigo & Roxo',
    primary: 'indigo-500',
    secondary: 'purple-500',
    gradient: 'from-indigo-500 to-purple-500',
    description: 'Tons profundos e misteriosos'
  },
  {
    id: 'green-emerald',
    name: 'Verde & Esmeralda',
    primary: 'green-500',
    secondary: 'emerald-500',
    gradient: 'from-green-500 to-emerald-500',
    description: 'Natureza e frescor'
  },
  {
    id: 'rose-pink',
    name: 'Rosa & Rosa Claro',
    primary: 'rose-500',
    secondary: 'pink-400',
    gradient: 'from-rose-500 to-pink-400',
    description: 'Tons suaves e românticos'
  }
];

// Base de dados de alimentos (APENAS NOMES - sem imagens)
const foodDatabase: Food[] = [
  // PROTEÍNAS MAGRAS
  { id: '1', name: 'Peito de Frango', category: 'Proteínas', protein: 31.0, calories: 165, carbs: 0, fat: 3.6, fiber: 0, sodium: 74 },
  { id: '2', name: 'Tilápia', category: 'Proteínas', protein: 26.2, calories: 128, carbs: 0, fat: 2.7, fiber: 0, sodium: 52 },
  { id: '3', name: 'Salmão', category: 'Proteínas', protein: 25.4, calories: 208, carbs: 0, fat: 12.4, fiber: 0, sodium: 59 },
  { id: '4', name: 'Atum', category: 'Proteínas', protein: 29.9, calories: 144, carbs: 0, fat: 4.9, fiber: 0, sodium: 47 },
  { id: '5', name: 'Sardinha', category: 'Proteínas', protein: 24.6, calories: 208, carbs: 0, fat: 11.5, fiber: 0, sodium: 307 },
  { id: '6', name: 'Ovo Inteiro', category: 'Proteínas', protein: 13.0, calories: 155, carbs: 1.1, fat: 11, fiber: 0, sodium: 124 },
  { id: '7', name: 'Clara de Ovo', category: 'Proteínas', protein: 10.9, calories: 52, carbs: 0.7, fat: 0.2, fiber: 0, sodium: 166 },
  { id: '8', name: 'Patinho (Carne Bovina)', category: 'Proteínas', protein: 32.8, calories: 163, carbs: 0, fat: 4.0, fiber: 0, sodium: 60 },
  { id: '9', name: 'Coxão Mole', category: 'Proteínas', protein: 31.7, calories: 176, carbs: 0, fat: 5.1, fiber: 0, sodium: 58 },
  { id: '10', name: 'Músculo (Carne Bovina)', category: 'Proteínas', protein: 28.4, calories: 124, carbs: 0, fat: 2.8, fiber: 0, sodium: 65 },
  { id: '11', name: 'Peru', category: 'Proteínas', protein: 29.3, calories: 189, carbs: 0, fat: 7.4, fiber: 0, sodium: 70 },
  { id: '12', name: 'Queijo Cottage', category: 'Proteínas', protein: 11.0, calories: 98, carbs: 3.4, fat: 4.3, fiber: 0, sodium: 364 },
  { id: '13', name: 'Ricota', category: 'Proteínas', protein: 11.3, calories: 174, carbs: 3.0, fat: 13.0, fiber: 0, sodium: 84 },
  { id: '14', name: 'Iogurte Natural sem Açúcar', category: 'Proteínas', protein: 4.3, calories: 51, carbs: 6.6, fat: 0.2, fiber: 0, sodium: 60 },
  { id: '15', name: 'Whey Protein', category: 'Proteínas', protein: 80.0, calories: 400, carbs: 5.0, fat: 5.0, fiber: 0, sodium: 200 },
  { id: '16', name: 'Tofu', category: 'Proteínas', protein: 8.1, calories: 76, carbs: 1.9, fat: 4.8, fiber: 0.4, sodium: 7 },
  { id: '17', name: 'Grão-de-bico', category: 'Proteínas', protein: 8.9, calories: 164, carbs: 27, fat: 2.6, fiber: 7.6, sodium: 7 },
  { id: '18', name: 'Lentilha', category: 'Proteínas', protein: 9.0, calories: 116, carbs: 20, fat: 0.4, fiber: 7.9, sodium: 2 },
  { id: '19', name: 'Feijão', category: 'Proteínas', protein: 8.9, calories: 132, carbs: 24, fat: 0.5, fiber: 8.7, sodium: 2 },

  // VEGETAIS E VERDURAS
  { id: '20', name: 'Brócolis', category: 'Vegetais', protein: 3.0, calories: 25, carbs: 5, fat: 0.3, fiber: 3.0, sodium: 41 },
  { id: '21', name: 'Couve-flor', category: 'Vegetais', protein: 1.9, calories: 25, carbs: 5, fat: 0.3, fiber: 2.0, sodium: 30 },
  { id: '22', name: 'Espinafre', category: 'Vegetais', protein: 2.9, calories: 23, carbs: 3.6, fat: 0.4, fiber: 2.2, sodium: 79 },
  { id: '23', name: 'Couve', category: 'Vegetais', protein: 4.3, calories: 49, carbs: 10, fat: 0.7, fiber: 3.6, sodium: 38 },
  { id: '24', name: 'Alface', category: 'Vegetais', protein: 1.4, calories: 15, carbs: 2.9, fat: 0.2, fiber: 1.3, sodium: 28 },
  { id: '25', name: 'Rúcula', category: 'Vegetais', protein: 2.6, calories: 25, carbs: 3.7, fat: 0.7, fiber: 1.6, sodium: 27 },
  { id: '26', name: 'Agrião', category: 'Vegetais', protein: 2.3, calories: 11, carbs: 1.3, fat: 0.1, fiber: 0.5, sodium: 41 },
  { id: '27', name: 'Cenoura', category: 'Vegetais', protein: 0.9, calories: 41, carbs: 10, fat: 0.2, fiber: 2.8, sodium: 69 },
  { id: '28', name: 'Abobrinha', category: 'Vegetais', protein: 1.2, calories: 17, carbs: 3.1, fat: 0.3, fiber: 1.0, sodium: 8 },
  { id: '29', name: 'Berinjela', category: 'Vegetais', protein: 1.0, calories: 25, carbs: 6, fat: 0.2, fiber: 3.0, sodium: 2 },
  { id: '30', name: 'Pimentão', category: 'Vegetais', protein: 1.0, calories: 31, carbs: 7, fat: 0.3, fiber: 2.5, sodium: 4 },
  { id: '31', name: 'Pepino', category: 'Vegetais', protein: 0.7, calories: 16, carbs: 4, fat: 0.1, fiber: 0.5, sodium: 2 },
  { id: '32', name: 'Tomate', category: 'Vegetais', protein: 0.9, calories: 18, carbs: 3.9, fat: 0.2, fiber: 1.2, sodium: 5 },
  { id: '33', name: 'Cogumelos', category: 'Vegetais', protein: 3.1, calories: 22, carbs: 3.3, fat: 0.3, fiber: 1.0, sodium: 5 },

  // FRUTAS (BAIXO ÍNDICE GLICÊMICO)
  { id: '34', name: 'Maçã', category: 'Frutas', protein: 0.3, calories: 52, carbs: 14, fat: 0.2, fiber: 2.4, sodium: 1 },
  { id: '35', name: 'Pera', category: 'Frutas', protein: 0.4, calories: 57, carbs: 15, fat: 0.1, fiber: 3.1, sodium: 1 },
  { id: '36', name: 'Morango', category: 'Frutas', protein: 0.7, calories: 32, carbs: 7.7, fat: 0.3, fiber: 2.0, sodium: 1 },
  { id: '37', name: 'Mirtilo (Blueberry)', category: 'Frutas', protein: 0.7, calories: 57, carbs: 14, fat: 0.3, fiber: 2.4, sodium: 1 },
  { id: '38', name: 'Amora', category: 'Frutas', protein: 1.4, calories: 43, carbs: 10, fat: 0.5, fiber: 5.3, sodium: 1 },
  { id: '39', name: 'Kiwi', category: 'Frutas', protein: 1.1, calories: 61, carbs: 15, fat: 0.5, fiber: 3.0, sodium: 3 },
  { id: '40', name: 'Mamão', category: 'Frutas', protein: 0.5, calories: 43, carbs: 11, fat: 0.3, fiber: 1.7, sodium: 8 },
  { id: '41', name: 'Melão', category: 'Frutas', protein: 0.8, calories: 34, carbs: 8.2, fat: 0.2, fiber: 0.9, sodium: 16 },
  { id: '42', name: 'Laranja', category: 'Frutas', protein: 0.9, calories: 47, carbs: 12, fat: 0.1, fiber: 2.4, sodium: 0 },
  { id: '43', name: 'Abacaxi', category: 'Frutas', protein: 0.5, calories: 50, carbs: 13, fat: 0.1, fiber: 1.4, sodium: 1 },

  // CARBOIDRATOS INTEGRAIS E SAUDÁVEIS
  { id: '44', name: 'Arroz Integral', category: 'Carboidratos', protein: 2.6, calories: 112, carbs: 23, fat: 0.9, fiber: 1.8, sodium: 5 },
  { id: '45', name: 'Batata-doce', category: 'Carboidratos', protein: 2.0, calories: 86, carbs: 20, fat: 0.1, fiber: 3.0, sodium: 54 },
  { id: '46', name: 'Batata Inglesa', category: 'Carboidratos', protein: 2.0, calories: 77, carbs: 17, fat: 0.1, fiber: 2.2, sodium: 6 },
  { id: '47', name: 'Mandioca', category: 'Carboidratos', protein: 1.4, calories: 125, carbs: 30, fat: 0.3, fiber: 1.8, sodium: 2 },
  { id: '48', name: 'Inhame', category: 'Carboidratos', protein: 1.5, calories: 116, carbs: 28, fat: 0.2, fiber: 4.1, sodium: 9 },
  { id: '49', name: 'Aveia', category: 'Carboidratos', protein: 13.2, calories: 394, carbs: 67, fat: 6.9, fiber: 9.1, sodium: 5 },
  { id: '50', name: 'Quinoa', category: 'Carboidratos', protein: 4.4, calories: 120, carbs: 22, fat: 1.9, fiber: 2.8, sodium: 7 },
  { id: '51', name: 'Pão Integral', category: 'Carboidratos', protein: 8.0, calories: 247, carbs: 41, fat: 4.2, fiber: 6.9, sodium: 489 },
  { id: '52', name: 'Massa Integral', category: 'Carboidratos', protein: 5.0, calories: 124, carbs: 25, fat: 1.1, fiber: 3.2, sodium: 6 },
  { id: '53', name: 'Milho Cozido', category: 'Carboidratos', protein: 3.4, calories: 96, carbs: 21, fat: 1.5, fiber: 2.4, sodium: 15 },

  // GORDURAS BOAS
  { id: '54', name: 'Azeite de Oliva Extra Virgem', category: 'Gorduras', protein: 0, calories: 884, carbs: 0, fat: 100, fiber: 0, sodium: 2 },
  { id: '55', name: 'Abacate', category: 'Gorduras', protein: 2.0, calories: 160, carbs: 9, fat: 15, fiber: 6.7, sodium: 7 },
  { id: '56', name: 'Nozes', category: 'Gorduras', protein: 15.2, calories: 654, carbs: 14, fat: 65, fiber: 6.7, sodium: 2 },
  { id: '57', name: 'Amêndoas', category: 'Gorduras', protein: 21.2, calories: 579, carbs: 22, fat: 50, fiber: 12.5, sodium: 1 },
  { id: '58', name: 'Castanha-do-Pará', category: 'Gorduras', protein: 14.3, calories: 656, carbs: 12, fat: 67, fiber: 7.5, sodium: 3 },
  { id: '59', name: 'Castanha de Caju', category: 'Gorduras', protein: 18.2, calories: 553, carbs: 30, fat: 44, fiber: 3.3, sodium: 12 },
  { id: '60', name: 'Semente de Chia', category: 'Gorduras', protein: 17.0, calories: 486, carbs: 42, fat: 31, fiber: 34, sodium: 16 },
  { id: '61', name: 'Semente de Linhaça', category: 'Gorduras', protein: 18.3, calories: 534, carbs: 29, fat: 42, fiber: 27, sodium: 30 },
  { id: '62', name: 'Semente de Girassol', category: 'Gorduras', protein: 20.8, calories: 584, carbs: 20, fat: 51, fiber: 8.6, sodium: 9 },
  { id: '63', name: 'Semente de Abóbora', category: 'Gorduras', protein: 19.0, calories: 559, carbs: 11, fat: 49, fiber: 6.0, sodium: 7 },
  { id: '64', name: 'Pasta de Amendoim Natural', category: 'Gorduras', protein: 25.8, calories: 588, carbs: 16, fat: 50, fiber: 8.5, sodium: 17 },

  // BEBIDAS E LÍQUIDOS
  { id: '65', name: 'Água', category: 'Bebidas', protein: 0, calories: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 },
  { id: '66', name: 'Chá Verde', category: 'Bebidas', protein: 0, calories: 1, carbs: 0, fat: 0, fiber: 0, sodium: 1 },
  { id: '67', name: 'Chá de Camomila', category: 'Bebidas', protein: 0, calories: 1, carbs: 0, fat: 0, fiber: 0, sodium: 2 },
  { id: '68', name: 'Chá de Hibisco', category: 'Bebidas', protein: 0, calories: 1, carbs: 0, fat: 0, fiber: 0, sodium: 1 },
  { id: '69', name: 'Água de Coco', category: 'Bebidas', protein: 0.7, calories: 19, carbs: 3.7, fat: 0.2, fiber: 1.1, sodium: 105 }
];

// Categorias com ícones atualizadas
const categories = [
  { value: 'all', label: 'Todos os Alimentos', icon: '🍽️' },
  { value: 'Proteínas', label: 'Proteínas Magras', icon: '🥩' },
  { value: 'Vegetais', label: 'Vegetais e Verduras', icon: '🥬' },
  { value: 'Frutas', label: 'Frutas', icon: '🍎' },
  { value: 'Carboidratos', label: 'Carboidratos Integrais', icon: '🌾' },
  { value: 'Gorduras', label: 'Gorduras Boas', icon: '🥑' },
  { value: 'Bebidas', label: 'Bebidas e Líquidos', icon: '💧' }
];

export default function FoodSearchApp() {
  const [currentView, setCurrentView] = useState<'search' | 'competition' | 'notes' | 'settings'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>(foodDatabase);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedColorScheme, setSelectedColorScheme] = useState('emerald-blue');
  
  // Estados para competição
  const [dailyGoal, setDailyGoal] = useState(100); // meta diária de proteína
  const [consumedFoods, setConsumedFoods] = useState<{ foodId: string; quantity: number; }[]>([]);
  const [selectedFood, setSelectedFood] = useState('');
  const [quantity, setQuantity] = useState(100);
  
  // Estados para anotações de consumo
  const [consumptionNotes, setConsumptionNotes] = useState<ConsumptionNote[]>([]);
  const [newNoteFoodName, setNewNoteFoodName] = useState('');
  const [newNoteQuantity, setNewNoteQuantity] = useState('');
  const [newNoteUnit, setNewNoteUnit] = useState('g');
  const [newNoteCategory, setNewNoteCategory] = useState<'food' | 'drink'>('food');
  const [newNoteNotes, setNewNoteNotes] = useState('');
  
  // Estados para autocomplete de alimentos
  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);
  const [foodSuggestions, setFoodSuggestions] = useState<string[]>([]);
  
  // Estados da IA de Nutricionismo
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  
  // Estados para perfil do usuário
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    goal: '',
    activityLevel: 'moderate'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Dados simulados de disciplina (últimos 7 dias)
  const [disciplineData] = useState([
    { day: 'Seg', protein: 85, goal: 100 },
    { day: 'Ter', protein: 120, goal: 100 },
    { day: 'Qua', protein: 95, goal: 100 },
    { day: 'Qui', protein: 110, goal: 100 },
    { day: 'Sex', protein: 75, goal: 100 },
    { day: 'Sáb', protein: 130, goal: 100 },
    { day: 'Dom', protein: 105, goal: 100 }
  ]);

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

  // Função para obter o esquema de cores atual
  const getCurrentColorScheme = () => {
    return colorSchemes.find(scheme => scheme.id === selectedColorScheme) || colorSchemes[0];
  };

  // Aplicar tema escuro/claro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('foodApp_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    const savedConsumed = localStorage.getItem('foodApp_consumed');
    if (savedConsumed) {
      setConsumedFoods(JSON.parse(savedConsumed));
    }

    const savedNotes = localStorage.getItem('foodApp_consumptionNotes');
    if (savedNotes) {
      setConsumptionNotes(JSON.parse(savedNotes));
    }

    const savedProfile = localStorage.getItem('foodApp_userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    const savedTheme = localStorage.getItem('foodApp_darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }

    const savedColorScheme = localStorage.getItem('foodApp_colorScheme');
    if (savedColorScheme) {
      setSelectedColorScheme(savedColorScheme);
    }

    // Mensagem inicial da IA
    setAiMessages([{
      id: '1',
      type: 'ai',
      content: 'Olá! Sou sua assistente de nutricionismo. Posso te ajudar com dicas sobre proteínas, planejamento de refeições, suplementação e muito mais! Como posso ajudar você hoje?',
      timestamp: new Date()
    }]);
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('foodApp_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('foodApp_consumed', JSON.stringify(consumedFoods));
  }, [consumedFoods]);

  useEffect(() => {
    localStorage.setItem('foodApp_consumptionNotes', JSON.stringify(consumptionNotes));
  }, [consumptionNotes]);

  useEffect(() => {
    localStorage.setItem('foodApp_userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('foodApp_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('foodApp_colorScheme', selectedColorScheme);
  }, [selectedColorScheme]);

  // Função para obter sugestões de alimentos baseado na entrada
  const getFoodSuggestions = (input: string) => {
    if (!input.trim()) return [];
    
    const inputLower = input.toLowerCase();
    
    // Combinar alimentos comuns e alimentos do banco de dados
    const allFoods = [...commonFoods, ...foodDatabase.map(food => food.name)];
    
    // Filtrar por iniciais ou nome completo
    const suggestions = allFoods.filter(food => {
      const foodLower = food.toLowerCase();
      
      // Busca por iniciais (ex: "pf" para "Peito de Frango")
      const words = foodLower.split(' ');
      const initials = words.map(word => word.charAt(0)).join('');
      
      // Busca por nome completo ou iniciais
      return foodLower.includes(inputLower) || initials.includes(inputLower);
    });
    
    // Remover duplicatas e limitar a 8 sugestões
    return [...new Set(suggestions)].slice(0, 8);
  };

  // Função para processar pergunta da IA
  const processAIQuestion = (question: string): string => {
    const q = question.toLowerCase();
    
    // Proteínas
    if (q.includes('proteína') || q.includes('protein')) {
      if (q.includes('quanto') || q.includes('quantidade')) {
        return `Para calcular sua necessidade de proteína:\n\n• Sedentário: ${nutritionKnowledge.proteins.daily_needs.sedentary}\n• Ativo: ${nutritionKnowledge.proteins.daily_needs.active}\n• Atleta: ${nutritionKnowledge.proteins.daily_needs.athlete}\n\n${nutritionKnowledge.proteins.timing}`;
      }
      if (q.includes('fonte') || q.includes('alimento')) {
        return `Excelentes fontes de proteína:\n\n🥩 Animais: ${nutritionKnowledge.proteins.sources.animal.join(', ')}\n\n🌱 Vegetais: ${nutritionKnowledge.proteins.sources.plant.join(', ')}\n\nDica: Combine diferentes fontes para obter todos os aminoácidos essenciais!`;
      }
    }
    
    // Suplementos
    if (q.includes('suplemento') || q.includes('whey') || q.includes('creatina')) {
      return `Principais suplementos:\n\n💪 Whey Protein: ${nutritionKnowledge.supplements.whey}\n🌙 Caseína: ${nutritionKnowledge.supplements.casein}\n⚡ Creatina: ${nutritionKnowledge.supplements.creatine}\n🔋 BCAA: ${nutritionKnowledge.supplements.bcaa}\n\nLembre-se: suplementos complementam, não substituem uma boa alimentação!`;
    }
    
    // Planejamento de refeições
    if (q.includes('refeição') || q.includes('cardápio') || q.includes('dieta')) {
      return `Planejamento de refeições:\n\n🌅 Café da manhã: ${nutritionKnowledge.meal_planning.breakfast}\n🍽️ Almoço: ${nutritionKnowledge.meal_planning.lunch}\n🌆 Jantar: ${nutritionKnowledge.meal_planning.dinner}\n🥜 Lanches: ${nutritionKnowledge.meal_planning.snacks}\n\nDica: Prepare as refeições com antecedência para manter a consistência!`;
    }
    
    // Dicas gerais
    if (q.includes('dica') || q.includes('conselho') || q.includes('ajuda')) {
      const randomTip = nutritionKnowledge.tips[Math.floor(Math.random() * nutritionKnowledge.tips.length)];
      return `💡 Dica importante: ${randomTip}\n\nOutras dicas valiosas:\n${nutritionKnowledge.tips.filter(tip => tip !== randomTip).slice(0, 3).map(tip => `• ${tip}`).join('\n')}`;
    }
    
    // Resposta padrão
    return `Posso te ajudar com:\n\n🥩 Necessidades de proteína\n💊 Suplementação\n🍽️ Planejamento de refeições\n💡 Dicas de nutrição\n📊 Análise do seu progresso\n\nFaça uma pergunta específica sobre qualquer um desses temas!`;
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
    
    // Simular delay de processamento
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: processAIQuestion(userInput),
        timestamp: new Date()
      };
      
      setAiMessages(prev => [...prev, aiResponse]);
      setIsAITyping(false);
    }, 1500);
  };

  // Salvar perfil do usuário
  const saveUserProfile = () => {
    setIsEditingProfile(false);
    // O perfil já é salvo automaticamente via useEffect
  };

  // Atualizar sugestões quando o campo de alimento muda
  useEffect(() => {
    if (newNoteFoodName.trim()) {
      const suggestions = getFoodSuggestions(newNoteFoodName);
      setFoodSuggestions(suggestions);
      setShowFoodSuggestions(suggestions.length > 0);
    } else {
      setShowFoodSuggestions(false);
      setFoodSuggestions([]);
    }
  }, [newNoteFoodName]);

  // Função para normalizar texto (remover acentos)
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Filtrar alimentos
  useEffect(() => {
    let filtered = foodDatabase;

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(food => food.category === selectedCategory);
    }

    // Filtro por busca (com normalização de acentos)
    if (searchTerm) {
      const normalizedSearchTerm = normalizeText(searchTerm);
      filtered = filtered.filter(food => 
        normalizeText(food.name).includes(normalizedSearchTerm)
      );
    }

    // Filtro por favoritos
    if (showFavoritesOnly) {
      filtered = filtered.filter(food => favorites.includes(food.id));
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'protein':
          return b.protein - a.protein;
        case 'calories':
          return a.calories - b.calories;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredFoods(filtered);
  }, [searchTerm, selectedCategory, favorites, showFavoritesOnly, sortBy]);

  // Adicionar/remover favorito
  const toggleFavorite = (foodId: string) => {
    setFavorites(prev => 
      prev.includes(foodId) 
        ? prev.filter(id => id !== foodId)
        : [...prev, foodId]
    );
  };

  // Adicionar alimento consumido
  const addConsumedFood = () => {
    if (!selectedFood) return;
    
    const existingIndex = consumedFoods.findIndex(item => item.foodId === selectedFood);
    
    if (existingIndex >= 0) {
      const updated = [...consumedFoods];
      updated[existingIndex].quantity += quantity;
      setConsumedFoods(updated);
    } else {
      setConsumedFoods(prev => [...prev, { foodId: selectedFood, quantity }]);
    }
    
    setSelectedFood('');
    setQuantity(100);
  };

  // Remover alimento consumido
  const removeConsumedFood = (foodId: string) => {
    setConsumedFoods(prev => prev.filter(item => item.foodId !== foodId));
  };

  // Selecionar sugestão de alimento
  const selectFoodSuggestion = (foodName: string) => {
    setNewNoteFoodName(foodName);
    setShowFoodSuggestions(false);
  };

  // Adicionar nova anotação de consumo
  const addConsumptionNote = () => {
    if (!newNoteFoodName.trim() || !newNoteQuantity.trim()) return;

    const newNote: ConsumptionNote = {
      id: Date.now().toString(),
      foodName: newNoteFoodName.trim(),
      quantity: parseFloat(newNoteQuantity),
      unit: newNoteUnit,
      timestamp: new Date().toISOString(),
      category: newNoteCategory,
      notes: newNoteNotes.trim() || undefined
    };

    setConsumptionNotes(prev => [newNote, ...prev]);
    
    // Limpar formulário
    setNewNoteFoodName('');
    setNewNoteQuantity('');
    setNewNoteUnit('g');
    setNewNoteCategory('food');
    setNewNoteNotes('');
    setShowFoodSuggestions(false);
  };

  // Remover anotação de consumo
  const removeConsumptionNote = (noteId: string) => {
    setConsumptionNotes(prev => prev.filter(note => note.id !== noteId));
  };

  // Calcular proteína total consumida hoje
  const getTotalProteinConsumed = () => {
    return consumedFoods.reduce((total, item) => {
      const food = foodDatabase.find(f => f.id === item.foodId);
      if (food) {
        return total + (food.protein * item.quantity / 100);
      }
      return total;
    }, 0);
  };

  // Compartilhar competição
  const shareCompetition = () => {
    const shareText = `🏆 Desafio Proteína!\n\nVenha competir comigo para ver quem consegue atingir a meta diária de ${dailyGoal}g de proteína!\n\nMinha disciplina atual: ${Math.round((getTotalProteinConsumed() / dailyGoal) * 100)}%\n\nAcesse: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Desafio Proteína',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Link copiado para a área de transferência!');
    }
  };

  // Obter sugestões de favoritos para a barra de pesquisa
  const getFavoriteSuggestions = () => {
    if (!searchTerm || favorites.length === 0) return [];
    
    return foodDatabase
      .filter(food => 
        favorites.includes(food.id) && 
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);
  };

  // Formatar data/hora
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Obter anotações de hoje
  const getTodayNotes = () => {
    const today = new Date().toDateString();
    return consumptionNotes.filter(note => 
      new Date(note.timestamp).toDateString() === today
    );
  };

  const favoriteSuggestions = getFavoriteSuggestions();
  const totalProteinToday = getTotalProteinConsumed();
  const progressPercentage = Math.min((totalProteinToday / dailyGoal) * 100, 100);
  const todayNotes = getTodayNotes();
  const currentColorScheme = getCurrentColorScheme();

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${currentColorScheme.gradient} rounded-lg flex items-center justify-center`}>
              <Apple className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-bold bg-gradient-to-r ${currentColorScheme.gradient} bg-clip-text text-transparent`}>
                NutriTracker
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Disciplina hoje, resultado amanhã</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            <Link href="/ia-nutricionista">
              <Button
                variant="ghost"
                className="w-full justify-start"
              >
                <Bot className="w-4 h-4 mr-3" />
                IA Nutricionista
              </Button>
            </Link>
            
            <Button
              variant={currentView === 'notes' ? "default" : "ghost"}
              onClick={() => setCurrentView('notes')}
              className="w-full justify-start"
            >
              <FileText className="w-4 h-4 mr-3" />
              Anotações
            </Button>
            
            <Button
              variant={currentView === 'competition' ? "default" : "ghost"}
              onClick={() => setCurrentView('competition')}
              className="w-full justify-start"
            >
              <Trophy className="w-4 h-4 mr-3" />
              Competição
            </Button>
            
            <Link href="/tabela">
              <Button variant="ghost" className="w-full justify-start">
                <Calculator className="w-4 h-4 mr-3" />
                Calculadora de Água
              </Button>
            </Link>
            
            <Link href="/ranking">
              <Button variant="ghost" className="w-full justify-start">
                <Award className="w-4 h-4 mr-3" />
                Ranking
              </Button>
            </Link>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <Button
                variant={currentView === 'settings' ? "default" : "ghost"}
                onClick={() => setCurrentView('settings')}
                className="w-full justify-start"
              >
                <Settings className="w-4 h-4 mr-3" />
                Configurações
              </Button>
            </div>
          </div>
        </nav>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-emerald-100 dark:border-gray-700 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mr-2"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                
                <div className="lg:hidden flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${currentColorScheme.gradient} rounded-lg flex items-center justify-center`}>
                    <Apple className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className={`text-lg font-bold bg-gradient-to-r ${currentColorScheme.gradient} bg-clip-text text-transparent`}>
                      NutriTracker
                    </h1>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Navigation Buttons - Desktop */}
                <div className="hidden lg:flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <Button
                    variant={currentView === 'search' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentView('search')}
                    className="flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Início</span>
                  </Button>
                  <Button
                    variant={currentView === 'notes' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentView('notes')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Anotações</span>
                  </Button>
                  <Button
                    variant={currentView === 'competition' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentView('competition')}
                    className="flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    <span className="hidden sm:inline">Competição</span>
                  </Button>
                </div>

                {currentView === 'search' && (
                  <Button
                    variant={showFavoritesOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className="flex items-center gap-2"
                  >
                    <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'text-white' : 'text-red-500'}`} />
                    <span className="hidden sm:inline">Favoritos</span>
                    {favorites.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {favorites.length}
                      </Badge>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* IA Nutricionista Chat */}
        {showAI && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl h-[600px] flex flex-col">
              <CardHeader className={`bg-gradient-to-r ${currentColorScheme.gradient} text-white rounded-t-lg`}>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-6 h-6" />
                    IA Nutricionista
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAI(false)}
                    className="text-white hover:bg-white/20"
                  >
                    ✕
                  </Button>
                </CardTitle>
                <p className="text-green-100 text-sm">
                  Sua assistente especializada em nutrição e proteínas
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
                            <Bot className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-green-600">IA Nutricionista</span>
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
                          <Bot className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-600">IA Nutricionista</span>
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
                      className={`bg-gradient-to-r ${currentColorScheme.gradient} hover:from-green-600 hover:to-emerald-600 text-white`}
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
        )}

        <div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          style={
            currentView !== 'settings' ? {
              backgroundImage: 'url(https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/e93b3b1d-9399-41e7-9fb1-b4f4a6d184b2.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              position: 'relative'
            } : {}
          }
        >
          {/* Overlay para melhor legibilidade */}
          {currentView !== 'settings' && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-lg"></div>
          )}
          
          {/* Conteúdo com z-index para ficar acima do overlay */}
          <div className="relative z-10">
            {/* Quick Access Cards - Mobile */}
            <div className="md:hidden grid grid-cols-3 gap-3 mb-6">
              <Link href="/graficos">
                <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transition-all">
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Gráficos</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/tabela">
                <Card className={`bg-gradient-to-r ${currentColorScheme.gradient} text-white hover:shadow-lg transition-all`}>
                  <CardContent className="p-4 text-center">
                    <Calculator className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Calculadora de Água</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/ranking">
                <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg transition-all">
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Ranking</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {currentView === 'settings' ? (
              // PÁGINA DE CONFIGURAÇÕES
              <>
                {/* Header da seção de configurações */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                      <Settings className={`w-8 h-8 text-${currentColorScheme.primary}`} />
                      Configurações
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                      Personalize sua experiência no NutriTracker
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Perfil do Usuário */}
                  <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-${currentColorScheme.primary}-100 dark:border-gray-700`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className={`w-5 h-5 text-${currentColorScheme.primary}`} />
                          Perfil do Usuário
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingProfile(!isEditingProfile)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          {isEditingProfile ? 'Cancelar' : 'Editar'}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div>
                          <Label htmlFor="email">E-mail</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={userProfile.email}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                            disabled={!isEditingProfile}
                            className="mt-1"
                          />
                        </div>
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
                            <SelectItem value="sedentary">Sedentário (pouco ou nenhum exercício)</SelectItem>
                            <SelectItem value="light">Leve (exercício leve 1-3 dias/semana)</SelectItem>
                            <SelectItem value="moderate">Moderado (exercício moderado 3-5 dias/semana)</SelectItem>
                            <SelectItem value="active">Ativo (exercício pesado 6-7 dias/semana)</SelectItem>
                            <SelectItem value="very_active">Muito Ativo (exercício muito pesado, trabalho físico)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {isEditingProfile && (
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={saveUserProfile}
                            className={`bg-gradient-to-r ${currentColorScheme.gradient} hover:from-emerald-600 hover:to-blue-600 text-white`}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Perfil
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Preferências de Tema e Cores */}
                  <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-${currentColorScheme.primary}-100 dark:border-gray-700`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {darkMode ? <Moon className={`w-5 h-5 text-${currentColorScheme.primary}`} /> : <Sun className={`w-5 h-5 text-${currentColorScheme.primary}`} />}
                        Aparência
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label className="text-base font-medium">Tema da Interface</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Escolha entre o modo claro ou escuro para uma melhor experiência visual
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            variant={!darkMode ? "default" : "outline"}
                            onClick={() => setDarkMode(false)}
                            className="h-20 flex flex-col items-center justify-center gap-2"
                          >
                            <Sun className="w-6 h-6" />
                            <span>Modo Claro</span>
                          </Button>
                          <Button
                            variant={darkMode ? "default" : "outline"}
                            onClick={() => setDarkMode(true)}
                            className="h-20 flex flex-col items-center justify-center gap-2"
                          >
                            <Moon className="w-6 h-6" />
                            <span>Modo Escuro</span>
                          </Button>
                        </div>
                      </div>

                      {/* Sistema de Cores */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <Label className="text-base font-medium flex items-center gap-2">
                          <Palette className={`w-5 h-5 text-${currentColorScheme.primary}`} />
                          Esquema de Cores
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Personalize as cores do aplicativo escolhendo um dos esquemas disponíveis
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {colorSchemes.map((scheme) => (
                            <Button
                              key={scheme.id}
                              variant={selectedColorScheme === scheme.id ? "default" : "outline"}
                              onClick={() => setSelectedColorScheme(scheme.id)}
                              className="h-auto p-4 flex flex-col items-start gap-2 text-left"
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className={`w-8 h-8 bg-gradient-to-r ${scheme.gradient} rounded-full flex-shrink-0`}></div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{scheme.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {scheme.description}
                                  </p>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>

                        {/* Preview das cores selecionadas */}
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Preview do esquema selecionado:
                          </p>
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${currentColorScheme.gradient} rounded-lg flex items-center justify-center`}>
                              <Apple className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className={`font-bold bg-gradient-to-r ${currentColorScheme.gradient} bg-clip-text text-transparent`}>
                                {currentColorScheme.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {currentColorScheme.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <Label className="text-base font-medium">Configurações de Meta</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Ajuste sua meta diária de proteína
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <Label htmlFor="dailyGoal" className="min-w-fit">Meta Diária:</Label>
                          <Input
                            id="dailyGoal"
                            type="number"
                            value={dailyGoal}
                            onChange={(e) => setDailyGoal(Number(e.target.value))}
                            className="w-24"
                            min="50"
                            max="300"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">gramas de proteína</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Resumo do Perfil */}
                {(userProfile.name || userProfile.weight || userProfile.height) && (
                  <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-${currentColorScheme.primary}-100 dark:border-gray-700 mt-8`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className={`w-5 h-5 text-${currentColorScheme.primary}`} />
                        Resumo do Seu Perfil
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {userProfile.name && (
                          <div className={`text-center p-4 bg-${currentColorScheme.primary}-50 dark:bg-${currentColorScheme.primary}-900/20 rounded-lg`}>
                            <User className={`w-8 h-8 mx-auto mb-2 text-${currentColorScheme.primary}`} />
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{userProfile.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
                          </div>
                        )}
                        
                        {userProfile.age && (
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{userProfile.age} anos</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Idade</p>
                          </div>
                        )}
                        
                        {userProfile.weight && (
                          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{userProfile.weight} kg</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Peso</p>
                          </div>
                        )}
                        
                        {userProfile.height && (
                          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{userProfile.height} cm</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Altura</p>
                          </div>
                        )}
                      </div>
                      
                      {userProfile.goal && (
                        <div className={`mt-6 p-4 bg-gradient-to-r from-${currentColorScheme.primary}-50 to-${currentColorScheme.secondary}-50 dark:from-${currentColorScheme.primary}-900/20 dark:to-${currentColorScheme.secondary}-900/20 rounded-lg`}>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Seu Objetivo:</h4>
                          <p className="text-gray-700 dark:text-gray-300">{userProfile.goal}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : currentView === 'notes' ? (
              // PÁGINA DE ANOTAÇÕES DE CONSUMO
              <>
                {/* Header da seção de anotações */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3 drop-shadow-sm">
                      <Utensils className={`w-8 h-8 text-${currentColorScheme.primary}`} />
                      Anotações de Consumo
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 drop-shadow-sm">
                      Registre seus alimentos e bebidas consumidos ao longo do dia
                    </p>
                  </div>
                </div>

                {/* Resumo do dia */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className={`bg-gradient-to-r ${currentColorScheme.gradient} text-white backdrop-blur-sm`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-${currentColorScheme.primary}-100 text-sm`}>Anotações Hoje</p>
                          <p className="text-3xl font-bold">{todayNotes.length}</p>
                        </div>
                        <Clock className={`w-8 h-8 text-${currentColorScheme.primary}-200`} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Alimentos</p>
                          <p className="text-3xl font-bold">
                            {todayNotes.filter(note => note.category === 'food').length}
                          </p>
                        </div>
                        <Utensils className="w-8 h-8 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-cyan-100 text-sm">Bebidas</p>
                          <p className="text-3xl font-bold">
                            {todayNotes.filter(note => note.category === 'drink').length}
                          </p>
                        </div>
                        <Coffee className="w-8 h-8 text-cyan-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Formulário para nova anotação */}
                <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-${currentColorScheme.primary}-100 dark:border-gray-700 mb-8`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className={`w-5 h-5 text-${currentColorScheme.primary}`} />
                      Nova Anotação de Consumo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                      <div className="lg:col-span-2 relative">
                        <Input
                          placeholder="Digite o nome ou iniciais (ex: 'pf' para Peito de Frango)"
                          value={newNoteFoodName}
                          onChange={(e) => setNewNoteFoodName(e.target.value)}
                          onFocus={() => {
                            if (newNoteFoodName.trim()) {
                              setShowFoodSuggestions(true);
                            }
                          }}
                          className={`border-${currentColorScheme.primary}-200`}
                        />
                        
                        {/* Dropdown de sugestões */}
                        {showFoodSuggestions && foodSuggestions.length > 0 && (
                          <div className={`absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-${currentColorScheme.primary}-200 dark:border-gray-700 rounded-lg shadow-lg mt-1 z-20 max-h-60 overflow-y-auto`}>
                            <div className={`p-2 border-b border-${currentColorScheme.primary}-100 dark:border-gray-700`}>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Apple className={`w-3 h-3 text-${currentColorScheme.primary}`} />
                                Sugestões de alimentos
                              </p>
                            </div>
                            {foodSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => selectFoodSuggestion(suggestion)}
                                className={`w-full text-left p-3 hover:bg-${currentColorScheme.primary}-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-${currentColorScheme.primary}-50 dark:border-gray-700 last:border-b-0 transition-colors`}
                              >
                                <div className={`w-8 h-8 bg-${currentColorScheme.primary}-100 dark:bg-${currentColorScheme.primary}-900/20 rounded-full flex items-center justify-center`}>
                                  <Utensils className={`w-4 h-4 text-${currentColorScheme.primary}`} />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-gray-200">{suggestion}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Clique para selecionar</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Quantidade"
                          value={newNoteQuantity}
                          onChange={(e) => setNewNoteQuantity(e.target.value)}
                          className={`border-${currentColorScheme.primary}-200`}
                        />
                      </div>
                      <div>
                        <Select value={newNoteUnit} onValueChange={setNewNoteUnit}>
                          <SelectTrigger className={`border-${currentColorScheme.primary}-200`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">gramas (g)</SelectItem>
                            <SelectItem value="ml">mililitros (ml)</SelectItem>
                            <SelectItem value="unidade">unidade</SelectItem>
                            <SelectItem value="fatia">fatia</SelectItem>
                            <SelectItem value="colher">colher</SelectItem>
                            <SelectItem value="xícara">xícara</SelectItem>
                            <SelectItem value="copo">copo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Select value={newNoteCategory} onValueChange={(value: 'food' | 'drink') => setNewNoteCategory(value)}>
                          <SelectTrigger className={`border-${currentColorScheme.primary}-200`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="food">
                              <div className="flex items-center gap-2">
                                <Utensils className="w-4 h-4" />
                                Alimento
                              </div>
                            </SelectItem>
                            <SelectItem value="drink">
                              <div className="flex items-center gap-2">
                                <Coffee className="w-4 h-4" />
                                Bebida
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <Input
                        placeholder="Observações (opcional)"
                        value={newNoteNotes}
                        onChange={(e) => setNewNoteNotes(e.target.value)}
                        className={`border-${currentColorScheme.primary}-200`}
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={addConsumptionNote}
                        disabled={!newNoteFoodName.trim() || !newNoteQuantity.trim()}
                        className={`bg-gradient-to-r ${currentColorScheme.gradient} hover:from-emerald-600 hover:to-blue-600`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Anotação
                      </Button>
                      
                      {showFoodSuggestions && (
                        <Button 
                          variant="outline"
                          onClick={() => setShowFoodSuggestions(false)}
                          className="text-gray-500"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Fechar Sugestões
                        </Button>
                      )}
                    </div>

                  </CardContent>
                </Card>

                {/* Lista de anotações */}
                <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-${currentColorScheme.primary}-100 dark:border-gray-700`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className={`w-5 h-5 text-${currentColorScheme.primary}`} />
                      Histórico de Consumo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {consumptionNotes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p>Nenhuma anotação registrada ainda.</p>
                        <p className="text-sm">Comece adicionando seus alimentos e bebidas acima!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {consumptionNotes.map((note) => (
                          <div key={note.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                note.category === 'food' 
                                  ? `bg-${currentColorScheme.primary}-100 dark:bg-${currentColorScheme.primary}-900/20 text-${currentColorScheme.primary}` 
                                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                              }`}>
                                {note.category === 'food' ? (
                                  <Utensils className="w-5 h-5" />
                                ) : (
                                  <Coffee className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{note.foodName}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {note.quantity} {note.unit}
                                </p>
                                {note.notes && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{note.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDateTime(note.timestamp)}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {note.category === 'food' ? 'Alimento' : 'Bebida'}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeConsumptionNote(note.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : currentView === 'search' ? (
              // PÁGINA DE BUSCA DE ALIMENTOS
              <>
                {/* Search and Filters */}
                <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-${currentColorScheme.primary}-100 dark:border-gray-700 mb-6`}>
                  <CardContent className="p-6">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                      <div className="relative">
                        <Apple className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          placeholder="Pesquise por alimentos (ex: frango, banana, arroz...)"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`pl-10 pr-4 h-12 text-lg border-${currentColorScheme.primary}-200 focus:border-${currentColorScheme.primary}-400`}
                        />
                        {searchTerm && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* Favorite Suggestions */}
                      {favoriteSuggestions.length > 0 && (
                        <div className={`absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-${currentColorScheme.primary}-200 dark:border-gray-700 rounded-lg shadow-lg mt-1 z-10`}>
                          <div className={`p-2 border-b border-${currentColorScheme.primary}-100 dark:border-gray-700`}>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              Seus favoritos
                            </p>
                          </div>
                          {favoriteSuggestions.map((food) => (
                            <button
                              key={food.id}
                              onClick={() => setSearchTerm(food.name)}
                              className={`w-full text-left p-3 hover:bg-${currentColorScheme.primary}-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-${currentColorScheme.primary}-50 dark:border-gray-700 last:border-b-0`}
                            >
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{food.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{food.protein}g de proteína</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className={`border-${currentColorScheme.primary}-200`}>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center gap-2">
                                  <span>{category.icon}</span>
                                  {category.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className={`border-${currentColorScheme.primary}-200`}>
                            <SelectValue placeholder="Ordenar por" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Nome (A-Z)</SelectItem>
                            <SelectItem value="protein">Maior Proteína</SelectItem>
                            <SelectItem value="calories">Menor Caloria</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 drop-shadow-sm">
                      {showFavoritesOnly ? 'Seus Favoritos' : 'Resultados da Pesquisa'}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 drop-shadow-sm">
                      {filteredFoods.length} alimento{filteredFoods.length !== 1 ? 's' : ''} encontrado{filteredFoods.length !== 1 ? 's' : ''}
                      {searchTerm && ` para "${searchTerm}"`}
                    </p>
                  </div>
                </div>

                {/* Food Grid */}
                {filteredFoods.length === 0 ? (
                  <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-${currentColorScheme.primary}-100 dark:border-gray-700`}>
                    <CardContent className="p-12 text-center">
                      <Apple className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Nenhum alimento encontrado
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Tente ajustar sua pesquisa ou filtros para encontrar mais resultados.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredFoods.map((food) => (
                      <Card key={food.id} className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-${currentColorScheme.primary}-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                        <CardContent className="p-6">
                          {/* Food Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 dark:text-gray-200 leading-tight">{food.name}</h3>
                              <Badge variant="outline" className="text-xs mt-1">
                                {food.category}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(food.id)}
                              className="p-1 h-8 w-8 ml-2"
                            >
                              {favorites.includes(food.id) ? (
                                <BookmarkCheck className="w-4 h-4 text-red-500" />
                              ) : (
                                <Bookmark className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                          </div>

                          {/* Protein Highlight */}
                          <div className={`bg-gradient-to-r ${currentColorScheme.gradient} text-white rounded-lg p-3 mb-4`}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Proteína</span>
                              <Beef className="w-4 h-4" />
                            </div>
                            <p className="text-2xl font-bold">{food.protein}g</p>
                            <p className={`text-xs text-${currentColorScheme.primary}-100`}>por 100g</p>
                          </div>

                          {/* Nutrition Table */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-600">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Calorias</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{food.calories} kcal</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-600">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Carboidratos</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{food.carbs}g</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-600">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Gorduras</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{food.fat}g</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-600">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Fibras</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{food.fiber}g</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Sódio</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{food.sodium}mg</span>
                            </div>
                          </div>

                          {/* Nutrition Level Indicators */}
                          <div className="mt-4 space-y-3">
                            {/* Calorias */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Calorias</span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {food.calories >= 300 ? 'Alto' : food.calories >= 150 ? 'Médio' : 'Baixo'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    food.calories >= 300 ? 'bg-red-500' : 
                                    food.calories >= 150 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min((food.calories / 400) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Carboidratos */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Carboidratos</span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {food.carbs >= 30 ? 'Alto' : food.carbs >= 15 ? 'Médio' : 'Baixo'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    food.carbs >= 30 ? 'bg-orange-500' : 
                                    food.carbs >= 15 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min((food.carbs / 50) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Gorduras */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Gorduras</span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {food.fat >= 20 ? 'Alto' : food.fat >= 10 ? 'Médio' : 'Baixo'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    food.fat >= 20 ? 'bg-purple-500' : 
                                    food.fat >= 10 ? 'bg-blue-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min((food.fat / 30) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Fibras */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Fibras</span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {food.fiber >= 5 ? 'Alto' : food.fiber >= 2 ? 'Médio' : 'Baixo'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    food.fiber >= 5 ? 'bg-green-500' : 
                                    food.fiber >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min((food.fiber / 10) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Sódio */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Sódio</span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {food.sodium >= 200 ? 'Alto' : food.sodium >= 100 ? 'Médio' : 'Baixo'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    food.sodium >= 200 ? 'bg-red-500' : 
                                    food.sodium >= 100 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min((food.sodium / 500) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Quick Stats */}
                {filteredFoods.length > 0 && (
                  <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-${currentColorScheme.primary}-100 dark:border-gray-700 mt-8`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className={`w-5 h-5 text-${currentColorScheme.primary}`} />
                        Estatísticas dos Resultados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`text-center p-4 bg-${currentColorScheme.primary}-50 dark:bg-${currentColorScheme.primary}-900/20 rounded-lg`}>
                          <p className={`text-2xl font-bold text-${currentColorScheme.primary}`}>
                            {Math.max(...filteredFoods.map(f => f.protein)).toFixed(1)}g
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Maior Proteína</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">
                            {(filteredFoods.reduce((sum, f) => sum + f.protein, 0) / filteredFoods.length).toFixed(1)}g
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Proteína Média</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">
                            {Math.min(...filteredFoods.map(f => f.calories))}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Menor Caloria</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">
                            {favorites.length}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Favoritos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              // PÁGINA DE COMPETIÇÃO
              <>
                {/* Competition Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3 drop-shadow-sm">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                      Competição de Proteínas
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 drop-shadow-sm">
                      Desafie seus amigos e acompanhe sua disciplina diária
                    </p>
                  </div>
                  <Button
                    onClick={shareCompetition}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar Desafio
                  </Button>
                </div>

                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className={`bg-gradient-to-r ${currentColorScheme.gradient} text-white backdrop-blur-sm`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-${currentColorScheme.primary}-100 text-sm`}>Meta Diária</p>
                          <p className="text-3xl font-bold">{dailyGoal}g</p>
                        </div>
                        <Target className={`w-8 h-8 text-${currentColorScheme.primary}-200`} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Consumido Hoje</p>
                          <p className="text-3xl font-bold">{totalProteinToday.toFixed(1)}g</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Progresso</p>
                          <p className="text-3xl font-bold">{progressPercentage.toFixed(0)}%</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-orange-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Discipline Chart */}
                <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-${currentColorScheme.primary}-100 dark:border-gray-700 mb-8`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className={`w-5 h-5 text-${currentColorScheme.primary}`} />
                      Gráfico de Disciplina - Últimos 7 Dias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-4 p-4">
                      {disciplineData.map((day, index) => {
                        const height = Math.max((day.protein / 150) * 100, 10); // altura mínima de 10%
                        const isGoalMet = day.protein >= day.goal;
                        
                        return (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div className="relative w-full max-w-12 mb-2">
                              <div 
                                className={`w-full rounded-t-lg transition-all duration-500 ${
                                  isGoalMet ? 'bg-green-500' : 'bg-red-400'
                                }`}
                                style={{ height: `${height}%`, minHeight: '20px' }}
                              ></div>
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {day.protein}g
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{day.day}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">Meta: {day.goal}g</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-gray-700 dark:text-gray-300">Meta Atingida</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-400 rounded"></div>
                        <span className="text-gray-700 dark:text-gray-300">Meta Não Atingida</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Add Food Section */}
                <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-${currentColorScheme.primary}-100 dark:border-gray-700 mb-8`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className={`w-5 h-5 text-${currentColorScheme.primary}`} />
                      Adicionar Alimento Consumido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Select value={selectedFood} onValueChange={setSelectedFood}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um alimento" />
                          </SelectTrigger>
                          <SelectContent>
                            {foodDatabase
                              .filter(food => food.protein > 0)
                              .sort((a, b) => b.protein - a.protein)
                              .map((food) => (
                                <SelectItem key={food.id} value={food.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{food.name}</span>
                                    <Badge variant="outline" className="ml-2">
                                      {food.protein}g
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          placeholder="Gramas"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          min="1"
                        />
                      </div>
                      <Button onClick={addConsumedFood} disabled={!selectedFood}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Consumption Table */}
                <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-${currentColorScheme.primary}-100 dark:border-gray-700`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Beef className={`w-5 h-5 text-${currentColorScheme.primary}`} />
                      Consumo de Proteínas - Hoje
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {consumedFoods.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Beef className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p>Nenhum alimento adicionado ainda.</p>
                        <p className="text-sm">Comece adicionando seus alimentos consumidos acima!</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300">Alimento</th>
                                <th className="text-center py-3 px-2 text-gray-700 dark:text-gray-300">Quantidade</th>
                                <th className="text-center py-3 px-2 text-gray-700 dark:text-gray-300">Proteína</th>
                                <th className="text-center py-3 px-2 text-gray-700 dark:text-gray-300">Calorias</th>
                                <th className="text-center py-3 px-2 text-gray-700 dark:text-gray-300">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {consumedFoods.map((item, index) => {
                                const food = foodDatabase.find(f => f.id === item.foodId);
                                if (!food) return null;
                                
                                const proteinAmount = (food.protein * item.quantity / 100);
                                const caloriesAmount = (food.calories * item.quantity / 100);
                                
                                return (
                                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="py-3 px-2">
                                      <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{food.name}</p>
                                        <Badge variant="outline" className="text-xs">
                                          {food.category}
                                        </Badge>
                                      </div>
                                    </td>
                                    <td className="text-center py-3 px-2 font-medium text-gray-800 dark:text-gray-200">
                                      {item.quantity}g
                                    </td>
                                    <td className="text-center py-3 px-2">
                                      <span className={`font-bold text-${currentColorScheme.primary}`}>
                                        {proteinAmount.toFixed(1)}g
                                      </span>
                                    </td>
                                    <td className="text-center py-3 px-2 text-gray-800 dark:text-gray-200">
                                      {caloriesAmount.toFixed(0)} kcal
                                    </td>
                                    <td className="text-center py-3 px-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeConsumedFood(item.foodId)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Total Summary */}
                        <div className={`mt-6 p-4 bg-gradient-to-r from-${currentColorScheme.primary}-50 to-${currentColorScheme.secondary}-50 dark:from-${currentColorScheme.primary}-900/20 dark:to-${currentColorScheme.secondary}-900/20 rounded-lg`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Total de Proteína Consumida Hoje
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Meta: {dailyGoal}g | Progresso: {progressPercentage.toFixed(1)}%
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-3xl font-bold text-${currentColorScheme.primary}`}>
                                {totalProteinToday.toFixed(1)}g
                              </p>
                              <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-3 mt-2">
                                <div 
                                  className={`h-3 rounded-full transition-all duration-500 ${
                                    progressPercentage >= 100 ? 'bg-green-500' : 
                                    progressPercentage >= 75 ? 'bg-yellow-500' : 'bg-red-400'
                                  }`}
                                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}