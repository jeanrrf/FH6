import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CarFront, 
  Plus, 
  Search, 
  Star, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  Loader2, 
  Grid, 
  List, 
  X,
  Sparkles,
  Flame,
  Check,
  Eye,
  DollarSign,
  TrendingUp,
  Coins,
  Tag,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { 
  subscribeCars, 
  addCar, 
  updateCar, 
  deleteCar, 
  Car 
} from '../lib/firestore';
import { CAR_CATALOG, CAR_PACKS, CatalogCar, formatCr } from '../lib/carDatabase';

export function Garage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'garage' | 'catalog' | 'watchlist'>('garage');
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [importingPack, setImportingPack] = useState<string | null>(null);
  
  // Filters & Sorting for Personal Garage
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedDrivetrain, setSelectedDrivetrain] = useState<string>('ALL');
  const [priceRange, setPriceRange] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'pi_desc' | 'pi_asc' | 'price_desc' | 'price_asc' | 'power_desc' | 'alpha'>('pi_desc');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Filters for Franchise Catalog
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogClass, setCatalogClass] = useState<string>('ALL');
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');
  const [catalogDrivetrain, setCatalogDrivetrain] = useState<string>('ALL');
  const [catalogPriceRange, setCatalogPriceRange] = useState<string>('ALL');
  const [catalogSortBy, setCatalogSortBy] = useState<'price_desc' | 'price_asc' | 'pi_desc' | 'power_desc' | 'alpha'>('pi_desc');
  const [addedCarKeys, setAddedCarKeys] = useState<Record<string, boolean>>({});

  // Watched catalog cars stored in localStorage for fast watchlist tracking
  const [watchedCatalogModels, setWatchedCatalogModels] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fh6_watched_models');
      return saved ? JSON.parse(saved) : ['Valkyrie', 'Skyline GT-R V-Spec II (R34)', 'Jesko', 'Supra RZ (A80)'];
    } catch {
      return ['Valkyrie', 'Skyline GT-R V-Spec II (R34)', 'Jesko', 'Supra RZ (A80)'];
    }
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeCars(user.uid, (data) => {
      setCars(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const toggleCatalogWatch = (model: string) => {
    setWatchedCatalogModels(prev => {
      const exists = prev.includes(model);
      const next = exists ? prev.filter(m => m !== model) : [...prev, model];
      try {
        localStorage.setItem('fh6_watched_models', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleToggleFavorite = async (e: React.MouseEvent, car: Car) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !car.id) return;
    await updateCar(user.uid, car.id, { isFavorite: !car.isFavorite });
  };

  const handleToggleWatch = async (e: React.MouseEvent, car: Car) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !car.id) return;
    await updateCar(user.uid, car.id, { isWatched: !car.isWatched });
  };

  const handleDeleteCar = async (e: React.MouseEvent, carId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (window.confirm("Remove this vehicle from your personal garage?")) {
      await deleteCar(user.uid, carId);
    }
  };

  const handleAddCatalogCarToGarage = async (catalogCar: CatalogCar) => {
    if (!user) return;
    const key = `${catalogCar.brand}-${catalogCar.model}-${catalogCar.year}`;
    try {
      setAddedCarKeys(prev => ({ ...prev, [key]: true }));
      await addCar(user.uid, {
        brand: catalogCar.brand,
        model: catalogCar.model,
        year: catalogCar.year,
        carClass: catalogCar.carClass,
        pi: catalogCar.pi,
        power: catalogCar.power,
        weight: catalogCar.weight,
        drivetrain: catalogCar.drivetrain,
        priceCr: catalogCar.priceCr,
        rarity: catalogCar.rarity || 'Autoshow',
        status: 'Active Tuning',
        isFavorite: false,
        isWatched: watchedCatalogModels.includes(catalogCar.model),
        notes: `${catalogCar.category || 'Franchise'} • ${catalogCar.engineType || ''}`
      });
      setTimeout(() => {
        setAddedCarKeys(prev => ({ ...prev, [key]: false }));
      }, 2500);
    } catch (err) {
      console.error(err);
      alert('Failed to add car to garage');
      setAddedCarKeys(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleImportPack = async (packId: string) => {
    if (!user) return;
    const pack = CAR_PACKS.find(p => p.id === packId);
    if (!pack) return;
    
    if (!window.confirm(`Import "${pack.name}" into your personal garage?`)) return;

    try {
      setImportingPack(packId);
      const matchingCars = CAR_CATALOG.filter(pack.filter);
      for (const car of matchingCars) {
        const exists = cars.some(c => c.brand === car.brand && c.model === car.model && c.year === car.year);
        if (!exists) {
          await addCar(user.uid, {
            brand: car.brand,
            model: car.model,
            year: car.year,
            carClass: car.carClass,
            pi: car.pi,
            power: car.power,
            weight: car.weight,
            drivetrain: car.drivetrain,
            priceCr: car.priceCr,
            rarity: car.rarity || 'Autoshow',
            status: 'Active Tuning',
            isFavorite: false,
            isWatched: false,
            notes: `${car.category || 'Pack Car'} • ${car.engineType || ''}`
          });
        }
      }
      setImportingPack(null);
      setActiveTab('garage');
    } catch (err) {
      console.error(err);
      alert('Error importing pack');
      setImportingPack(null);
    }
  };

  // Fleet Financial Metrics
  const totalFleetValue = useMemo(() => {
    return cars.reduce((sum, c) => sum + (c.priceCr || 50000), 0);
  }, [cars]);

  const avgCarValue = useMemo(() => {
    if (cars.length === 0) return 0;
    return Math.round(totalFleetValue / cars.length);
  }, [cars, totalFleetValue]);

  const watchedCarsCount = useMemo(() => {
    const garageWatched = cars.filter(c => c.isWatched).length;
    const catalogWatched = watchedCatalogModels.length;
    return garageWatched + catalogWatched;
  }, [cars, watchedCatalogModels]);

  // Filtered & Sorted Garage Cars
  const filteredGarageCars = useMemo(() => {
    return cars
      .filter(car => {
        const query = search.toLowerCase();
        const matchesSearch = `${car.brand} ${car.model}`.toLowerCase().includes(query) ||
                              car.carClass.toLowerCase().includes(query) ||
                              car.drivetrain.toLowerCase().includes(query);
        const matchesClass = selectedClass === 'ALL' || car.carClass.toUpperCase() === selectedClass;
        const matchesDrivetrain = selectedDrivetrain === 'ALL' || car.drivetrain.toUpperCase() === selectedDrivetrain;
        const matchesFavorite = !onlyFavorites || car.isFavorite;
        
        const price = car.priceCr || 50000;
        let matchesPrice = true;
        if (priceRange === 'under_50k') matchesPrice = price < 50000;
        else if (priceRange === '50k_200k') matchesPrice = price >= 50000 && price <= 200000;
        else if (priceRange === '200k_1m') matchesPrice = price > 200000 && price <= 1000000;
        else if (priceRange === 'over_1m') matchesPrice = price > 1000000;

        return matchesSearch && matchesClass && matchesDrivetrain && matchesFavorite && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'pi_desc') return b.pi - a.pi;
        if (sortBy === 'pi_asc') return a.pi - b.pi;
        if (sortBy === 'price_desc') return (b.priceCr || 0) - (a.priceCr || 0);
        if (sortBy === 'price_asc') return (a.priceCr || 0) - (b.priceCr || 0);
        if (sortBy === 'power_desc') return b.power - a.power;
        if (sortBy === 'alpha') return a.brand.localeCompare(b.brand);
        return 0;
      });
  }, [cars, search, selectedClass, selectedDrivetrain, onlyFavorites, priceRange, sortBy]);

  const categories = [
    'ALL',
    'Hypercar',
    'Track Toy',
    'Extreme Track Toy',
    'Supercar',
    'Retro Supercar',
    'JDM',
    'Modern Muscle',
    'Classic Muscle',
    'Rally',
    'Super Saloon',
    'Hot Hatch',
    'GT',
    'Off-road',
    'Vintage Racer',
    'Drift',
    'Classic'
  ];

  // Filtered & Sorted Catalog Cars
  const filteredCatalogCars = useMemo(() => {
    return CAR_CATALOG
      .filter(car => {
        const query = catalogSearch.toLowerCase();
        const matchesSearch = `${car.brand} ${car.model} ${car.category || ''} ${car.country || ''} ${car.engineType || ''}`.toLowerCase().includes(query) ||
                              car.carClass.toLowerCase().includes(query) ||
                              car.drivetrain.toLowerCase().includes(query);
        const matchesClass = catalogClass === 'ALL' || car.carClass.toUpperCase() === catalogClass;
        const matchesCategory = catalogCategory === 'ALL' || car.category === catalogCategory;
        const matchesDrivetrain = catalogDrivetrain === 'ALL' || car.drivetrain.toUpperCase() === catalogDrivetrain;

        let matchesPrice = true;
        if (catalogPriceRange === 'under_50k') matchesPrice = car.priceCr < 50000;
        else if (catalogPriceRange === '50k_200k') matchesPrice = car.priceCr >= 50000 && car.priceCr <= 200000;
        else if (catalogPriceRange === '200k_1m') matchesPrice = car.priceCr > 200000 && car.priceCr <= 1000000;
        else if (catalogPriceRange === 'over_1m') matchesPrice = car.priceCr > 1000000;

        return matchesSearch && matchesClass && matchesCategory && matchesDrivetrain && matchesPrice;
      })
      .sort((a, b) => {
        if (catalogSortBy === 'price_desc') return b.priceCr - a.priceCr;
        if (catalogSortBy === 'price_asc') return a.priceCr - b.priceCr;
        if (catalogSortBy === 'pi_desc') return b.pi - a.pi;
        if (catalogSortBy === 'power_desc') return b.power - a.power;
        if (catalogSortBy === 'alpha') return a.brand.localeCompare(b.brand);
        return 0;
      });
  }, [catalogSearch, catalogClass, catalogCategory, catalogDrivetrain, catalogPriceRange, catalogSortBy]);

  // Combined Watchlist Cars (both Garage & Franchise Catalog)
  const watchedCatalogCars = useMemo(() => {
    return CAR_CATALOG.filter(c => watchedCatalogModels.includes(c.model));
  }, [watchedCatalogModels]);

  const isCarInGarage = (brand: string, model: string, year: number) => {
    return cars.some(c => c.brand.toLowerCase() === brand.toLowerCase() && 
                          c.model.toLowerCase() === model.toLowerCase() && 
                          c.year === year);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto font-mono">
      {/* Header with Fleet Financial Summary */}
      <header className="border-b border-[#222] p-6 sm:p-8 bg-gradient-to-b from-[#141414] to-[#0a0a0a] shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#ef4444] font-bold mb-1 flex items-center gap-2">
              <span>Banco de Dados Forza</span>
              <span>•</span>
              <span>{CAR_CATALOG.length} Veículos Autênticos</span>
              <span>•</span>
              <span className="text-[#10b981] font-bold">{cars.length} Carros na Frota</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase">
              Garagem & Avaliação de Mercado
            </h1>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 bg-[#0e0e0e] border border-[#222] flex items-center gap-3">
              <Coins className="w-4 h-4 text-[#eab308]" />
              <div>
                <div className="text-[9px] text-[#666] uppercase">Valor da Frota</div>
                <div className="text-sm font-black text-white">{formatCr(totalFleetValue)}</div>
              </div>
            </div>

            <div className="px-4 py-2 bg-[#0e0e0e] border border-[#222] flex items-center gap-3">
              <Eye className="w-4 h-4 text-[#3b82f6]" />
              <div>
                <div className="text-[9px] text-[#666] uppercase">Lista de Desejos</div>
                <div className="text-sm font-black text-white">{watchedCarsCount} Monitorados</div>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-[#ef4444] text-black hover:bg-white text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar Custom
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-6 flex gap-2 border-b border-[#222]">
          <button
            onClick={() => setActiveTab('garage')}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'garage'
                ? 'border-[#ef4444] text-white'
                : 'border-transparent text-[#666] hover:text-[#bbb]'
            }`}
          >
            <CarFront className="w-4 h-4 text-[#ef4444]" />
            Frota Pessoal da Garagem ({cars.length})
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'catalog'
                ? 'border-[#ef4444] text-white'
                : 'border-transparent text-[#666] hover:text-[#bbb]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#eab308]" />
            Catálogo Geral & Preços ({CAR_CATALOG.length})
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'watchlist'
                ? 'border-[#3b82f6] text-white'
                : 'border-transparent text-[#666] hover:text-[#bbb]'
            }`}
          >
            <Eye className="w-4 h-4 text-[#3b82f6]" />
            Lista de Desejos / Preços ({watchedCarsCount})
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        {/* ========================================================= */}
        {/* TAB 1: PERSONAL GARAGE FLEET                              */}
        {/* ========================================================= */}
        {activeTab === 'garage' && (
          <div className="space-y-6">
            {/* Control Strip */}
            <div className="bg-[#0e0e0e] border border-[#222] p-4 flex flex-wrap items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar na garagem por marca, modelo, classe..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#141414] border border-[#262626] pl-9 pr-4 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#ef4444]"
                />
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-1 overflow-x-auto">
                <span className="text-[10px] text-[#555] uppercase mr-1">Classe:</span>
                {['ALL', 'X', 'S2', 'S1', 'A', 'B', 'C', 'D'].map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-2 py-1 text-[10px] font-bold uppercase transition-colors ${
                      selectedClass === cls
                        ? 'bg-[#ef4444] text-black'
                        : 'bg-[#141414] text-[#888] hover:text-white border border-[#222]'
                    }`}
                  >
                    {cls === 'ALL' ? 'TODAS' : cls}
                  </button>
                ))}
              </div>

              {/* Price Tier Filter */}
              <select
                value={priceRange}
                onChange={e => setPriceRange(e.target.value)}
                className="bg-[#141414] border border-[#262626] text-[10px] text-white uppercase px-2.5 py-1.5 focus:outline-none"
              >
                <option value="ALL">Todas as Faixas de Preço</option>
                <option value="under_50k">&lt; 50k CR (Econômico)</option>
                <option value="50k_200k">50k - 200k CR (Esportivos)</option>
                <option value="200k_1m">200k - 1M CR (Supercarros)</option>
                <option value="over_1m">1M+ CR (Hypercars / Lendas)</option>
              </select>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#666]" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-[#141414] border border-[#262626] text-[10px] text-white uppercase px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="pi_desc">Maior PI (Performance Máxima)</option>
                  <option value="pi_asc">Menor PI (Base Stock)</option>
                  <option value="price_desc">Preço: Maior para Menor (CR)</option>
                  <option value="price_asc">Preço: Menor para Maior (CR)</option>
                  <option value="power_desc">Maior Potência (HP)</option>
                  <option value="alpha">Ordem Alfabética (Marca)</option>
                </select>
              </div>

              {/* Favorites & View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOnlyFavorites(!onlyFavorites)}
                  className={`p-1.5 border transition-colors ${
                    onlyFavorites 
                      ? 'bg-[#ef4444]/10 border-[#ef4444] text-[#ef4444]' 
                      : 'bg-[#141414] border-[#262626] text-[#666] hover:text-white'
                  }`}
                  title="Apenas Favoritos"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>

                <div className="border border-[#262626] bg-[#141414] flex">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 ${viewMode === 'grid' ? 'text-[#ef4444] bg-[#222]' : 'text-[#666] hover:text-white'}`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 ${viewMode === 'table' ? 'text-[#ef4444] bg-[#222]' : 'text-[#666] hover:text-white'}`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Garage Grid / Table Content */}
            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <Loader2 className="w-8 h-8 text-[#ef4444] animate-spin" />
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#222] bg-[#0c0c0c] p-8 space-y-6">
                <CarFront className="w-12 h-12 text-[#444] mx-auto mb-2" />
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                    Sua Garagem Pessoal está Pronta
                  </h3>
                  <p className="text-xs text-[#777] max-w-lg mx-auto">
                    Adicione veículos com preços oficiais em Créditos (CR), ficha técnica de potência e classe de PI diretamente do catálogo Forza.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="px-6 py-3 bg-[#ef4444] text-black text-xs font-black uppercase tracking-wider hover:bg-white transition-colors inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Navegar pelo Catálogo ({CAR_CATALOG.length} Carros)
                  </button>
                  <button
                    onClick={() => handleImportPack('jdm_legends')}
                    className="px-5 py-3 bg-[#161616] border border-[#333] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#222] transition-colors"
                  >
                    + Importar Pacote Lendas JDM
                  </button>
                </div>
              </div>
            ) : filteredGarageCars.length === 0 ? (
              <div className="text-center py-16 border border-[#222] bg-[#0c0c0c]">
                <p className="text-xs text-[#666] uppercase tracking-widest">
                  Nenhum veículo encontrado com os filtros selecionados
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredGarageCars.map(car => (
                  <CarCard
                    key={car.id}
                    car={car}
                    onToggleFavorite={(e) => handleToggleFavorite(e, car)}
                    onToggleWatch={(e) => handleToggleWatch(e, car)}
                    onEdit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingCar(car);
                    }}
                    onDelete={(e) => handleDeleteCar(e, car.id!)}
                  />
                ))}
              </div>
            ) : (
              <CarTable 
                cars={filteredGarageCars}
                onToggleFavorite={handleToggleFavorite}
                onToggleWatch={handleToggleWatch}
                onEdit={(car) => setEditingCar(car)}
                onDelete={(id) => deleteCar(user!.uid, id)}
              />
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FRANCHISE ROSTER CATALOG & PRICES                  */}
        {/* ========================================================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Quick 1-Click Car Packs */}
            <div className="bg-[#0e0e0e] border border-[#222] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#ef4444]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Pacotes Iniciais Forza em 1 Clique
                  </h3>
                </div>
                <span className="text-[10px] text-[#777]">Importação em lote instantânea para sua frota</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CAR_PACKS.map(pack => (
                  <div key={pack.id} className="p-3 bg-[#080808] border border-[#1a1a1a] flex flex-col justify-between hover:border-[#333] transition-colors">
                    <div>
                      <div className="text-xs font-bold text-white uppercase mb-1">
                        {pack.name}
                      </div>
                      <p className="text-[10px] text-[#777] mb-3 leading-relaxed">
                        {pack.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleImportPack(pack.id)}
                      disabled={importingPack === pack.id}
                      className="w-full py-1.5 bg-[#181818] hover:bg-[#ef4444] hover:text-black border border-[#262626] text-white text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {importingPack === pack.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                      {importingPack === pack.id ? 'Importando Frota...' : `Importar Pacote (${pack.count} Carros)`}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Catalog Filter & Sort Bar */}
            <div className="bg-[#0e0e0e] border border-[#222] p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar catálogo (ex: 2JZ, RB26, Flat-6, V12, Supra, Valkyrie)..."
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    className="w-full bg-[#141414] border border-[#262626] pl-9 pr-4 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#ef4444]"
                  />
                </div>

                {/* Class Filters */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  <span className="text-[10px] text-[#555] uppercase mr-1">Classe:</span>
                  {['ALL', 'X', 'S2', 'S1', 'A', 'B', 'C', 'D', 'E'].map(cls => (
                    <button
                      key={cls}
                      onClick={() => setCatalogClass(cls)}
                      className={`px-2 py-1 text-[10px] font-bold uppercase transition-colors ${
                        catalogClass === cls
                          ? 'bg-[#ef4444] text-black'
                          : 'bg-[#141414] text-[#888] hover:text-white border border-[#222]'
                      }`}
                    >
                      {cls === 'ALL' ? 'TODAS' : cls}
                    </button>
                  ))}
                </div>

                {/* Price Range Filter */}
                <select
                  value={catalogPriceRange}
                  onChange={e => setCatalogPriceRange(e.target.value)}
                  className="bg-[#141414] border border-[#262626] text-[10px] text-white uppercase px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="ALL">Todas as Faixas de Preço</option>
                  <option value="under_50k">&lt; 50k CR</option>
                  <option value="50k_200k">50k - 200k CR</option>
                  <option value="200k_1m">200k - 1M CR</option>
                  <option value="over_1m">1M+ CR (Hypercars)</option>
                </select>

                {/* Sort Option */}
                <select
                  value={catalogSortBy}
                  onChange={e => setCatalogSortBy(e.target.value as any)}
                  className="bg-[#141414] border border-[#262626] text-[10px] text-white uppercase px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="pi_desc">Maior PI</option>
                  <option value="price_desc">Maior Preço (CR)</option>
                  <option value="price_asc">Menor Preço (CR)</option>
                  <option value="power_desc">Maior Potência (HP)</option>
                  <option value="alpha">Ordem Alfabética</option>
                </select>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-[#1a1a1a] pt-3">
                <span className="text-[10px] text-[#555] uppercase mr-1 shrink-0">Categoria:</span>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategory(cat)}
                    className={`px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors shrink-0 ${
                      catalogCategory === cat
                        ? 'bg-white text-black font-bold'
                        : 'bg-[#141414] text-[#777] hover:text-[#ccc] border border-[#222]'
                    }`}
                  >
                    {cat === 'ALL' ? 'TODAS' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCatalogCars.map((car, idx) => {
                const carKey = `${car.brand}-${car.model}-${car.year}`;
                const inGarage = isCarInGarage(car.brand, car.model, car.year);
                const isJustAdded = addedCarKeys[carKey];
                const isWatched = watchedCatalogModels.includes(car.model);

                return (
                  <div 
                    key={idx}
                    className="bg-[#0e0e0e] border border-[#222] p-5 flex flex-col justify-between hover:border-[#333] transition-all group relative"
                  >
                    <div>
                      {/* Top Badges: Class, PI, Drivetrain, Price & Watch button */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 font-black italic text-xs uppercase ${
                            car.carClass === 'X' ? 'bg-[#10b981] text-black' :
                            car.carClass === 'S2' ? 'bg-[#3b82f6] text-white' :
                            car.carClass === 'S1' ? 'bg-[#a855f7] text-white' :
                            car.carClass === 'A' ? 'bg-[#ef4444] text-black' :
                            car.carClass === 'B' ? 'bg-[#f97316] text-black' :
                            car.carClass === 'C' ? 'bg-[#eab308] text-black' :
                            'bg-[#64748b] text-white'
                          }`}>
                            {car.carClass} {car.pi}
                          </span>
                          <span className="text-[10px] text-[#777] border border-[#222] px-1.5 py-0.5">
                            {car.drivetrain} • {car.engineLocation || 'Front'}
                          </span>
                        </div>

                        {/* Price Badge & Watchlist toggle */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#eab308] bg-[#1a1600] border border-[#382f05] px-2 py-0.5">
                            {formatCr(car.priceCr)}
                          </span>

                          <button
                            onClick={() => toggleCatalogWatch(car.model)}
                            className={`p-1 border transition-colors ${
                              isWatched 
                                ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-[#3b82f6]' 
                                : 'bg-[#141414] border-[#222] text-[#555] hover:text-white'
                            }`}
                            title={isWatched ? 'Remover da Lista de Desejos' : 'Adicionar à Lista de Desejos'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Brand & Model */}
                      <div className="text-[10px] text-[#666] uppercase tracking-wider mb-0.5 flex items-center justify-between">
                        <span>{car.brand} • {car.year} {car.country ? `[${car.country}]` : ''}</span>
                        {car.rarity && (
                          <span className="text-[9px] text-[#888]">{car.rarity}</span>
                        )}
                      </div>

                      <h3 className="text-lg font-black italic tracking-tight text-white uppercase group-hover:text-[#ef4444] transition-colors">
                        {car.model}
                      </h3>

                      {car.engineType && (
                        <div className="text-[10px] text-[#ef4444] mt-1 font-semibold truncate">
                          {car.engineType}
                        </div>
                      )}

                      {/* Stats Matrix */}
                      <div className="grid grid-cols-3 gap-2 my-4 p-2.5 bg-[#080808] border border-[#1a1a1a]">
                        <div>
                          <div className="text-[8px] uppercase tracking-widest text-[#555]">Potência</div>
                          <div className="text-xs font-bold text-white">{car.power} HP</div>
                        </div>
                        <div>
                          <div className="text-[8px] uppercase tracking-widest text-[#555]">Peso</div>
                          <div className="text-xs font-bold text-white">{car.weight} KG</div>
                        </div>
                        <div>
                          <div className="text-[8px] uppercase tracking-widest text-[#555]">HP/TON</div>
                          <div className="text-xs font-bold text-[#10b981]">
                            {(car.power / (car.weight / 1000)).toFixed(0)} HP/T
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-[#1a1a1a] flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[#777]">
                        {inGarage ? (
                          <span className="text-[#10b981] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Na Frota Pessoal
                          </span>
                        ) : (
                          <span>Disponível no Autoshow</span>
                        )}
                      </span>

                      <button
                        onClick={() => handleAddCatalogCarToGarage(car)}
                        className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5 ${
                          isJustAdded
                            ? 'bg-[#10b981] text-black'
                            : inGarage
                            ? 'bg-[#181818] text-[#aaa] hover:bg-[#ef4444] hover:text-black border border-[#2c2c2c]'
                            : 'bg-[#ef4444] text-black hover:bg-white'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Adicionado!
                          </>
                        ) : inGarage ? (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Adicionar Outro Setup
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Adicionar à Garagem
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PRICE WATCHLIST & TARGETS                          */}
        {/* ========================================================= */}
        {activeTab === 'watchlist' && (
          <div className="space-y-6">
            <div className="bg-[#0e0e0e] border border-[#222] p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black italic text-white uppercase tracking-tight flex items-center gap-2">
                    <Eye className="w-5 h-5 text-[#3b82f6]" />
                    Lista de Monitoramento de Preços e Aquisições
                  </h3>
                  <p className="text-xs text-[#777] mt-1">
                    Acompanhe valores em Créditos (CR), metas de compra e carros monitorados na garagem e no catálogo geral do Forza.
                  </p>
                </div>
                <div className="text-xs text-[#aaa]">
                  Total Monitorado: <span className="text-[#3b82f6] font-bold">{watchedCarsCount} Veículos</span>
                </div>
              </div>
            </div>

            {/* Watched Cars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Garage Watched Cars */}
              {cars.filter(c => c.isWatched).map(car => (
                <div key={car.id} className="bg-[#0e0e0e] border border-[#3b82f6]/40 p-5 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/40 px-2 py-0.5 uppercase font-bold">
                        Na Garagem & Monitorado
                      </span>
                      <span className="text-xs font-bold text-[#eab308]">
                        {formatCr(car.priceCr)}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#666] uppercase">{car.brand} • {car.year}</div>
                    <h3 className="text-lg font-black italic text-white uppercase">{car.model}</h3>

                    <div className="my-3 p-2 bg-[#080808] border border-[#1a1a1a] flex justify-between text-xs">
                      <span className="text-[#888]">Classe {car.carClass} {car.pi}</span>
                      <span className="text-[#888]">{car.power} HP</span>
                      <span className="text-[#10b981] font-bold">{car.drivetrain}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1a1a1a] flex items-center justify-between">
                    <Link to={`/garage/car/${car.id}`} className="text-xs text-[#ef4444] font-bold flex items-center gap-1">
                      Abrir Estúdio <ArrowRight className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={(e) => handleToggleWatch(e, car)}
                      className="text-[10px] text-[#777] hover:text-[#ef4444]"
                    >
                      Remover Alerta
                    </button>
                  </div>
                </div>
              ))}

              {/* Catalog Watched Cars */}
              {watchedCatalogCars.map((car, idx) => (
                <div key={idx} className="bg-[#0e0e0e] border border-[#222] p-5 relative flex flex-col justify-between hover:border-[#3b82f6] transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/30 px-2 py-0.5 uppercase font-bold">
                        Meta de Aquisição
                      </span>
                      <span className="text-xs font-bold text-[#eab308]">
                        {formatCr(car.priceCr)}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#666] uppercase">{car.brand} • {car.year}</div>
                    <h3 className="text-lg font-black italic text-white uppercase">{car.model}</h3>

                    <div className="my-3 p-2 bg-[#080808] border border-[#1a1a1a] flex justify-between text-xs">
                      <span className="text-[#888]">Classe {car.carClass} {car.pi}</span>
                      <span className="text-[#888]">{car.power} HP</span>
                      <span className="text-[#3b82f6] font-bold">{car.category || 'Forza'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1a1a1a] flex items-center justify-between">
                    <button
                      onClick={() => handleAddCatalogCarToGarage(car)}
                      className="px-3 py-1 bg-[#ef4444] text-black text-[10px] font-bold uppercase hover:bg-white transition-colors"
                    >
                      + Comprar para Garagem
                    </button>
                    <button
                      onClick={() => toggleCatalogWatch(car.model)}
                      className="text-[10px] text-[#777] hover:text-[#ef4444]"
                    >
                      Remover Alerta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingCar) && (
        <CarModal
          title={editingCar ? 'Editar Especificações do Veículo' : 'Adicionar Veículo à Garagem'}
          initialData={editingCar || undefined}
          onClose={() => {
            setShowAddModal(false);
            setEditingCar(null);
          }}
          onSubmit={async (formData) => {
            if (!user) return;
            if (editingCar && editingCar.id) {
              await updateCar(user.uid, editingCar.id, formData);
            } else {
              await addCar(user.uid, formData);
            }
            setShowAddModal(false);
            setEditingCar(null);
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-components: CarCard & CarTable & CarModal
// -------------------------------------------------------------

function CarCard({ 
  car, 
  onToggleFavorite, 
  onToggleWatch,
  onEdit, 
  onDelete 
}: { 
  key?: React.Key;
  car: Car; 
  onToggleFavorite: (e: React.MouseEvent) => void | Promise<void>;
  onToggleWatch: (e: React.MouseEvent) => void | Promise<void>;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void | Promise<void>;
}) {
  return (
    <Link 
      to={`/garage/car/${car.id}`}
      className="bg-[#0e0e0e] border border-[#222] hover:border-[#444] p-6 transition-all group relative flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 font-black italic text-xs uppercase ${
              car.carClass === 'X' ? 'bg-[#10b981] text-black' :
              car.carClass === 'S2' ? 'bg-[#3b82f6] text-white' :
              car.carClass === 'S1' ? 'bg-[#a855f7] text-white' :
              car.carClass === 'A' ? 'bg-[#ef4444] text-black' :
              car.carClass === 'B' ? 'bg-[#f97316] text-black' :
              car.carClass === 'C' ? 'bg-[#eab308] text-black' :
              'bg-[#64748b] text-white'
            }`}>
              {car.carClass} {car.pi}
            </span>
            <span className="text-[10px] text-[#888] border border-[#222] px-1.5 py-0.5">
              {car.drivetrain}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#eab308] bg-[#1a1600] border border-[#382f05] px-2 py-0.5">
              {formatCr(car.priceCr)}
            </span>

            <button
              onClick={onToggleWatch}
              className={`p-1 transition-colors ${car.isWatched ? 'text-[#3b82f6]' : 'text-[#444] hover:text-white'}`}
              title="Monitorar Preço"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onToggleFavorite}
              className={`p-1 transition-colors ${car.isFavorite ? 'text-[#ef4444]' : 'text-[#444] hover:text-white'}`}
              title="Favoritar"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              onClick={onEdit}
              className="p-1 text-[#444] hover:text-white transition-colors"
              title="Editar Ficha"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onDelete}
              className="p-1 text-[#444] hover:text-[#ef4444] transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="text-[10px] text-[#666] uppercase tracking-wider mb-0.5">
          {car.brand} • {car.year} {car.rarity ? `[${car.rarity}]` : ''}
        </div>
        <h3 className="text-xl font-black italic tracking-tight text-white uppercase group-hover:text-[#ef4444] transition-colors">
          {car.model}
        </h3>

        <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-[#080808] border border-[#1a1a1a]">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-[#555]">Potência</div>
            <div className="text-sm font-bold text-white">{car.power} HP</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-widest text-[#555]">Peso</div>
            <div className="text-sm font-bold text-white">{car.weight} KG</div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[#1a1a1a] flex items-center justify-between">
        <span className="text-[10px] text-[#888] uppercase">
          Status: <span className="text-[#10b981]">{car.status || 'Ativo'}</span>
        </span>
        <span className="text-xs font-bold text-[#ef4444] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Abrir Estúdio <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

function CarTable({
  cars,
  onToggleFavorite,
  onToggleWatch,
  onEdit,
  onDelete
}: {
  cars: Car[];
  onToggleFavorite: (e: React.MouseEvent, car: Car) => void;
  onToggleWatch: (e: React.MouseEvent, car: Car) => void;
  onEdit: (car: Car) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-[#0e0e0e] border border-[#222] overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#222] bg-[#121212] text-[#777] uppercase text-[10px]">
            <th className="p-3 w-8">Fav</th>
            <th className="p-3 w-8">Alerta</th>
            <th className="p-3">Classe & PI</th>
            <th className="p-3">Veículo</th>
            <th className="p-3">Preço (CR)</th>
            <th className="p-3">Tração</th>
            <th className="p-3">Potência</th>
            <th className="p-3">Peso</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#181818]">
          {cars.map(car => (
            <tr key={car.id} className="hover:bg-[#151515] transition-colors group">
              <td className="p-3">
                <button
                  onClick={(e) => onToggleFavorite(e, car)}
                  className={`${car.isFavorite ? 'text-[#ef4444]' : 'text-[#444] hover:text-white'}`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </td>
              <td className="p-3">
                <button
                  onClick={(e) => onToggleWatch(e, car)}
                  className={`${car.isWatched ? 'text-[#3b82f6]' : 'text-[#444] hover:text-white'}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </td>
              <td className="p-3">
                <span className={`px-2 py-0.5 font-bold italic text-[10px] ${
                  car.carClass === 'X' ? 'bg-[#10b981] text-black' :
                  car.carClass === 'S2' ? 'bg-[#3b82f6] text-white' :
                  car.carClass === 'S1' ? 'bg-[#a855f7] text-white' :
                  car.carClass === 'A' ? 'bg-[#ef4444] text-black' :
                  'bg-[#f97316] text-black'
                }`}>
                  {car.carClass} {car.pi}
                </span>
              </td>
              <td className="p-3">
                <Link to={`/garage/car/${car.id}`} className="hover:text-[#ef4444] transition-colors">
                  <span className="text-[#888] mr-2">{car.year}</span>
                  <span className="font-bold text-white uppercase">{car.brand} {car.model}</span>
                </Link>
              </td>
              <td className="p-3 font-bold text-[#eab308]">{formatCr(car.priceCr)}</td>
              <td className="p-3 text-[#aaa]">{car.drivetrain}</td>
              <td className="p-3 font-bold text-white">{car.power} HP</td>
              <td className="p-3 text-[#aaa]">{car.weight} KG</td>
              <td className="p-3">
                <span className="text-[#10b981]">{car.status || 'Ativo'}</span>
              </td>
              <td className="p-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/garage/car/${car.id}`}
                    className="px-2 py-1 bg-[#222] hover:bg-[#ef4444] hover:text-black text-white text-[10px] uppercase font-bold"
                  >
                    Estúdio
                  </Link>
                  <button
                    onClick={() => onEdit(car)}
                    className="p-1 text-[#666] hover:text-white"
                    title="Editar Ficha"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Deseja excluir este veículo da garagem?")) onDelete(car.id!);
                    }}
                    className="p-1 text-[#666] hover:text-[#ef4444]"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CarModal({
  title,
  initialData,
  onClose,
  onSubmit
}: {
  title: string;
  initialData?: Car;
  onClose: () => void;
  onSubmit: (data: Omit<Car, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);
  const [formData, setFormData] = useState({
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || 2020,
    carClass: initialData?.carClass || 'S1',
    pi: initialData?.pi || 850,
    power: initialData?.power || 500,
    weight: initialData?.weight || 1400,
    drivetrain: initialData?.drivetrain || 'AWD',
    priceCr: initialData?.priceCr || 150000,
    rarity: initialData?.rarity || 'Autoshow',
    status: initialData?.status || 'Active Tuning',
    isFavorite: initialData?.isFavorite || false,
    isWatched: initialData?.isWatched || false,
    notes: initialData?.notes || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredCatalog = CAR_CATALOG.filter(c =>
    `${c.brand} ${c.model} ${c.category || ''} ${c.engineType || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCatalogCar = (car: CatalogCar) => {
    setFormData(prev => ({
      ...prev,
      brand: car.brand,
      model: car.model,
      year: car.year,
      carClass: car.carClass,
      pi: car.pi,
      power: car.power,
      weight: car.weight,
      drivetrain: car.drivetrain,
      priceCr: car.priceCr,
      rarity: car.rarity || 'Autoshow',
      notes: `${car.category || 'Franchise'} • ${car.engineType || ''}`
    }));
    setSearchQuery(`${car.brand} ${car.model}`);
    setShowCatalogDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onSubmit(formData);
    } catch (err) {
      console.error(err);
      alert('Error saving car');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div 
        className="bg-[#0e0e0e] border border-[#333] w-full max-w-xl p-6 sm:p-8 my-8 relative"
        onClick={() => setShowCatalogDropdown(false)}
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-[#666] hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-xs text-[#777] mb-6">
          Preencha a ficha técnica, valor em Créditos (CR) ou utilize o preenchimento automático do catálogo oficial.
        </p>

        {/* Catalog Search & Auto-Fill */}
        {!initialData && (
          <div className="mb-6 relative" onClick={(e) => e.stopPropagation()}>
            <label className="block text-[10px] uppercase tracking-widest text-[#ef4444] font-bold mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Auto-Preenchimento do Catálogo ({CAR_CATALOG.length} Carros)
            </label>
            <input
              type="text"
              placeholder="Buscar no catálogo (ex: Skyline, Supra, Senna, Jesko, GT3 RS, Demon)..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowCatalogDropdown(true);
              }}
              onFocus={() => setShowCatalogDropdown(true)}
              className="w-full bg-[#161616] border border-[#333] focus:border-[#ef4444] px-3.5 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none"
            />

            {showCatalogDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-[#161616] border border-[#444] max-h-60 overflow-y-auto shadow-2xl">
                {filteredCatalog.length > 0 ? (
                  filteredCatalog.map((car, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectCatalogCar(car)}
                      className="p-3 hover:bg-[#252525] cursor-pointer border-b border-[#222] last:border-0 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
                          <span>{car.brand} {car.model}</span>
                          <span className="text-[#777] font-normal text-[10px]">({car.year})</span>
                          <span className="text-[9px] text-[#eab308] font-bold">{formatCr(car.priceCr)}</span>
                        </div>
                        <div className="text-[10px] text-[#888]">
                          {car.power} HP • {car.weight} KG • {car.drivetrain} {car.engineType ? `• ${car.engineType}` : ''}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-[#ef4444] text-black font-black italic text-[10px] shrink-0">
                        {car.carClass} {car.pi}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-xs text-[#777] italic">
                    Nenhum veículo correspondente encontrado. Preencha manualmente abaixo.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Spec Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#777] mb-1">Marca (Brand)</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 text-xs text-white focus:border-[#ef4444] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#777] mb-1">Modelo (Model)</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 text-xs text-white focus:border-[#ef4444] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#777] mb-1">Ano</label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full bg-[#161616] border border-[#262626] p-2 text-xs text-white focus:border-[#ef4444] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#777] mb-1">Classe</label>
              <select
                value={formData.carClass}
                onChange={e => setFormData({ ...formData, carClass: e.target.value })}
                className="w-full bg-[#161616] border border-[#262626] p-2 text-xs text-white focus:border-[#ef4444] focus:outline-none uppercase"
              >
                {['E', 'D', 'C', 'B', 'A', 'S1', 'S2', 'X'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#777] mb-1">PI (100-999)</label>
              <input
                type="number"
                required
                min={100}
                max={999}
                value={formData.pi}
                onChange={e => setFormData({ ...formData, pi: Number(e.target.value) })}
                className="w-full bg-[#161616] border border-[#262626] p-2 text-xs text-white focus:border-[#ef4444] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#777] mb-1">Potência (HP)</label>
              <input
                type="number"
                required
                value={formData.power}
                onChange={e => setFormData({ ...formData, power: Number(e.target.value) })}
                className="w-full bg-[#161616] border border-[#262626] p-2 text-xs text-white focus:border-[#ef4444] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#777] mb-1">Peso (KG)</label>
              <input
                type="number"
                required
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                className="w-full bg-[#161616] border border-[#262626] p-2 text-xs text-white focus:border-[#ef4444] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#777] mb-1">Tração (Drivetrain)</label>
              <select
                value={formData.drivetrain}
                onChange={e => setFormData({ ...formData, drivetrain: e.target.value })}
                className="w-full bg-[#161616] border border-[#262626] p-2 text-xs text-white focus:border-[#ef4444] focus:outline-none uppercase"
              >
                {['FWD', 'RWD', 'AWD'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Rarity Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#eab308] font-bold mb-1">Valor (Créditos CR)</label>
              <input
                type="number"
                required
                step={1000}
                value={formData.priceCr}
                onChange={e => setFormData({ ...formData, priceCr: Number(e.target.value) })}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 text-xs text-white focus:border-[#eab308] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#777] mb-1">Raridade / Obtenção</label>
              <select
                value={formData.rarity}
                onChange={e => setFormData({ ...formData, rarity: e.target.value })}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 text-xs text-white focus:border-[#ef4444] focus:outline-none"
              >
                {['Autoshow', 'Exclusive', 'Wheelspin', 'Barn Find', 'Hard-to-Find', 'DLC'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#777] mb-1">Notas de Engenharia / Objetivo da Build</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ex: Build S1 900 Road Grip para circuitos de alta velocidade..."
              rows={2}
              className="w-full bg-[#161616] border border-[#262626] p-2.5 text-xs text-white focus:border-[#ef4444] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-[#888] hover:text-white uppercase tracking-wider"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#ef4444] text-black hover:bg-white text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Salvar Veículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
