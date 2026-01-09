'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Share2, Instagram, Facebook, Twitter, Linkedin, 
  Image, Video, Calendar, Clock, Send, Copy, Check,
  RefreshCw, Wand2, ThumbsUp, Eye, MessageCircle, Heart,
  TrendingUp, Hash, Target, Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface PostIdea {
  id: string
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
  content: string
  hashtags: string[]
  mediaType: 'image' | 'video' | 'carousel'
  scheduledFor?: string
  engagement?: {
    likes: number
    comments: number
    shares: number
    views: number
  }
}

interface ContentCalendarItem {
  date: string
  posts: PostIdea[]
}

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-500' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-700' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'from-gray-700 to-gray-900' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-900' }
]

const mockPosts: PostIdea[] = [
  {
    id: '1',
    platform: 'instagram',
    content: '📱 Az új iPhone 15 Pro Max most 15% kedvezménnyel! 🎉\n\nProfi kamera, titanium keret, A17 Pro chip. A legjobb iPhone valaha.\n\n🛒 Link a bióban!',
    hashtags: ['iphone15', 'apple', 'nexutech', 'telefon', 'akció'],
    mediaType: 'carousel',
    engagement: { likes: 234, comments: 45, shares: 12, views: 3450 }
  },
  {
    id: '2',
    platform: 'facebook',
    content: '🎮 Gaming hétvége a NEXU-nál!\n\nVásárolj gaming laptopot és kapj hozzá gaming egeret INGYEN! 🖱️\n\nAz akció csak vasárnapig tart!',
    hashtags: ['gaming', 'laptop', 'gamer', 'akció'],
    mediaType: 'video',
    engagement: { likes: 567, comments: 89, shares: 34, views: 8900 }
  },
  {
    id: '3',
    platform: 'twitter',
    content: '⚡ Gyors tipp: Tudtad, hogy az AirPods Pro 2 már USB-C-vel tölt? Nincs több kábel káosz! 🎧 #appletips #nexutech',
    hashtags: ['appletips', 'nexutech', 'airpods'],
    mediaType: 'image',
    engagement: { likes: 123, comments: 23, shares: 56, views: 2340 }
  }
]

export default function AISocialManager() {
  const [posts, setPosts] = useState<PostIdea[]>(mockPosts)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatorOpen, setGeneratorOpen] = useState(false)
  const [generatorInput, setGeneratorInput] = useState({
    product: '',
    goal: 'engagement',
    tone: 'casual',
    platform: 'instagram'
  })
  const [generatedContent, setGeneratedContent] = useState<PostIdea | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [view, setView] = useState<'posts' | 'calendar' | 'analytics'>('posts')

  const filteredPosts = selectedPlatform === 'all' 
    ? posts 
    : posts.filter(p => p.platform === selectedPlatform)

  const generateContent = async () => {
    setIsGenerating(true)
    await new Promise(r => setTimeout(r, 2000))
    
    const templates: Record<string, Record<string, string>> = {
      instagram: {
        engagement: `✨ ${generatorInput.product} - A te következő kedvenced! ✨\n\n🔥 Prémium minőség\n💯 Garancia\n🚚 Gyors szállítás\n\nKattints a linkre és fedezd fel! 👆`,
        sales: `🎉 AKCIÓ! 🎉\n\n${generatorInput.product} most különleges áron!\n\n⏰ Limitált ideig\n🛒 Ne hagyd ki!\n\nLink a bióban! 🔗`,
        awareness: `Ismerd meg a ${generatorInput.product} világát! 🌟\n\nMiért válaszd?\n✅ Csúcsminőség\n✅ Megbízhatóság\n✅ Stílus\n\n#nexutech #tech`
      },
      facebook: {
        engagement: `👋 Sziasztok NEXU közösség!\n\nMit szólnátok egy ${generatorInput.product}-hoz? 🤔\n\nÍrjátok meg kommentben, hogy ti mit várnátok el egy ilyen terméktől! 💬`,
        sales: `🛍️ Hétvégi ajánlat!\n\n${generatorInput.product} most akciós áron a NEXU-nál!\n\n✅ Ingyenes szállítás\n✅ 2 év garancia\n✅ 14 napos visszaküldés\n\nRendelj most! ➡️ nexu.hu`,
        awareness: `📱 Tech hírek a NEXU-tól!\n\n${generatorInput.product} - Minden amit tudnod kell:\n\n🔹 Innovatív technológia\n🔹 Modern dizájn\n🔹 Kiváló ár-érték arány\n\nTöbbet tudnál? Látogass el oldalunkra!`
      },
      twitter: {
        engagement: `${generatorInput.product} - A te véleményed? 🤔 #nexutech #tech`,
        sales: `⚡ Flash sale! ${generatorInput.product} most -20%! 🔥\n\nCsak 24 óráig! ⏰\n\nnexu.hu #akció`,
        awareness: `💡 Tech tip: ${generatorInput.product} tökéletes választás, ha minőséget keresel. #nexutech`
      },
      linkedin: {
        engagement: `Innovációk a tech világában\n\n${generatorInput.product} - Hogyan változtatja meg a munkafolyamatokat?\n\nÖssze tudjuk foglalni: hatékonyság, produktivitás, minőség.\n\nMit gondoltok? #technology #innovation`,
        sales: `B2B ajánlat: ${generatorInput.product}\n\n✓ Céges kedvezmények\n✓ Tömeges rendelés\n✓ Dedikált support\n\nVegye fel velünk a kapcsolatot: business@nexu.hu`,
        awareness: `A modern munkahely eszközei\n\n${generatorInput.product} review:\n\n📈 Növeli a produktivitást\n🔒 Megbízható és biztonságos\n💼 Ideális üzleti felhasználásra\n\n#business #technology`
      }
    }

    const platform = generatorInput.platform as keyof typeof templates
    const goal = generatorInput.goal as 'engagement' | 'sales' | 'awareness'
    
    const content = templates[platform]?.[goal] || templates.instagram.engagement
    
    const newPost: PostIdea = {
      id: Date.now().toString(),
      platform: platform as PostIdea['platform'],
      content,
      hashtags: ['nexutech', 'tech', generatorInput.product.toLowerCase().replace(/\s+/g, '')],
      mediaType: platform === 'instagram' ? 'carousel' : 'image'
    }
    
    setGeneratedContent(newPost)
    setIsGenerating(false)
  }

  const copyContent = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopied(id)
    toast.success('Tartalom másolva!')
    setTimeout(() => setCopied(null), 2000)
  }

  const savePost = () => {
    if (generatedContent) {
      setPosts(prev => [generatedContent, ...prev])
      toast.success('Poszt elmentve!')
      setGeneratorOpen(false)
      setGeneratedContent(null)
      setGeneratorInput({ product: '', goal: 'engagement', tone: 'casual', platform: 'instagram' })
    }
  }

  const getPlatformIcon = (platform: string) => {
    const p = platforms.find(pl => pl.id === platform)
    return p ? p.icon : Share2
  }

  const getPlatformColor = (platform: string) => {
    const p = platforms.find(pl => pl.id === platform)
    return p ? p.color : 'from-gray-500 to-gray-600'
  }

  const stats = {
    totalReach: posts.reduce((sum, p) => sum + (p.engagement?.views || 0), 0),
    totalEngagement: posts.reduce((sum, p) => sum + (p.engagement?.likes || 0) + (p.engagement?.comments || 0), 0),
    avgEngagementRate: 4.7,
    scheduledPosts: 5
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl">
            <Share2 className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Social Media Manager</h2>
            <p className="text-gray-400 text-sm">Közösségi média tartalom generálás és ütemezés</p>
          </div>
        </div>
        <button
          onClick={() => setGeneratorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg transition-all"
        >
          <Wand2 size={18} />
          Új tartalom generálása
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Eye size={14} />
            Összes elérés
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalReach.toLocaleString('hu-HU')}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Heart size={14} />
            Interakciók
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalEngagement.toLocaleString('hu-HU')}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <TrendingUp size={14} />
            Engagement rate
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.avgEngagementRate}%</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Calendar size={14} />
            Ütemezett posztok
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats.scheduledPosts}</p>
        </motion.div>
      </div>

      {/* View Tabs & Platform Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['posts', 'calendar', 'analytics'].map(v => (
            <button
              key={v}
              onClick={() => setView(v as typeof view)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === v
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {v === 'posts' ? 'Posztok' : v === 'calendar' ? 'Naptár' : 'Analitika'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedPlatform === 'all'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mind
          </button>
          {platforms.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                selectedPlatform === p.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <p.icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {view === 'posts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post, index) => {
            const Icon = getPlatformIcon(post.platform)
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/30 transition-colors"
              >
                {/* Platform Header */}
                <div className={`px-4 py-3 bg-gradient-to-r ${getPlatformColor(post.platform)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <Icon size={18} />
                      <span className="font-medium capitalize">{post.platform}</span>
                    </div>
                    <span className="text-white/70 text-xs flex items-center gap-1">
                      {post.mediaType === 'video' && <Video size={12} />}
                      {post.mediaType === 'image' && <Image size={12} />}
                      {post.mediaType === 'carousel' && <Sparkles size={12} />}
                      {post.mediaType}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-gray-300 text-sm whitespace-pre-line line-clamp-4 mb-3">
                    {post.content}
                  </p>
                  
                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.hashtags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Engagement Stats */}
                  {post.engagement && (
                    <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10">
                      <div className="text-center">
                        <Heart size={14} className="text-red-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-400">{post.engagement.likes}</span>
                      </div>
                      <div className="text-center">
                        <MessageCircle size={14} className="text-blue-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-400">{post.engagement.comments}</span>
                      </div>
                      <div className="text-center">
                        <Share2 size={14} className="text-green-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-400">{post.engagement.shares}</span>
                      </div>
                      <div className="text-center">
                        <Eye size={14} className="text-purple-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-400">{post.engagement.views}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => copyContent(post.content, post.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs rounded-lg transition-colors"
                    >
                      {copied === post.id ? <Check size={12} /> : <Copy size={12} />}
                      Másolás
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs rounded-lg transition-colors">
                      <Calendar size={12} />
                      Ütemezés
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="text-center py-12">
            <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Naptár nézet hamarosan...</p>
            <p className="text-gray-500 text-sm">Itt ütemezhetők és kezelhetők lesznek a posztok</p>
          </div>
        </div>
      )}

      {/* Analytics View */}
      {view === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-400" />
              Platform teljesítmény
            </h3>
            <div className="space-y-4">
              {platforms.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${p.color} flex items-center justify-center`}>
                    <p.icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">{p.name}</span>
                      <span className="text-green-400">+{Math.floor(Math.random() * 20 + 5)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${p.color} rounded-full`}
                        style={{ width: `${Math.floor(Math.random() * 40 + 40)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Hash size={18} className="text-purple-400" />
              Top hashtag-ek
            </h3>
            <div className="space-y-3">
              {['#nexutech', '#tech', '#iphone', '#gaming', '#akció'].map((tag, i) => (
                <div key={tag} className="flex items-center justify-between">
                  <span className="text-purple-400">{tag}</span>
                  <span className="text-gray-400">{Math.floor(Math.random() * 1000 + 200)} használat</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Generator Modal */}
      <AnimatePresence>
        {generatorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setGeneratorOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Wand2 className="text-purple-400" size={24} />
                AI Tartalom Generátor
              </h3>

              <div className="space-y-4">
                {/* Product Input */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Termék vagy téma</label>
                  <input
                    type="text"
                    value={generatorInput.product}
                    onChange={(e) => setGeneratorInput(prev => ({ ...prev, product: e.target.value }))}
                    placeholder="pl. iPhone 15 Pro Max"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Platform Select */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Platform</label>
                  <div className="grid grid-cols-4 gap-2">
                    {platforms.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setGeneratorInput(prev => ({ ...prev, platform: p.id }))}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors ${
                          generatorInput.platform === p.id
                            ? `bg-gradient-to-r ${p.color} border-transparent`
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <p.icon size={20} className="text-white" />
                        <span className="text-white text-xs">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal Select */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Cél</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'engagement', label: 'Interakció', icon: Heart },
                      { id: 'sales', label: 'Értékesítés', icon: Target },
                      { id: 'awareness', label: 'Ismertség', icon: Eye }
                    ].map(g => (
                      <button
                        key={g.id}
                        onClick={() => setGeneratorInput(prev => ({ ...prev, goal: g.id }))}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${
                          generatorInput.goal === g.id
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <g.icon size={16} />
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateContent}
                  disabled={!generatorInput.product || isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Generálás...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Tartalom generálása
                    </>
                  )}
                </button>

                {/* Generated Content Preview */}
                {generatedContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-white/5 rounded-xl border border-purple-500/30"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-purple-400 text-sm font-medium">Generált tartalom</span>
                      <button
                        onClick={() => copyContent(generatedContent.content, 'generated')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {copied === 'generated' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-line mb-3">
                      {generatedContent.content}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {generatedContent.hashtags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={generateContent}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                      >
                        <RefreshCw size={14} />
                        Újragenerálás
                      </button>
                      <button
                        onClick={savePost}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                      >
                        <Send size={14} />
                        Mentés és ütemezés
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
