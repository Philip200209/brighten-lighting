import { Lightbulb, ShieldCheck, Users, Globe } from 'lucide-react';

export function About() {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row gap-16 items-center mb-24">
          <div className="lg:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 mb-4">
              <Lightbulb className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm tracking-widest uppercase font-medium">Our Story</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight">
              Illuminating Spaces, <br/> <span className="text-gold">Elevating Lives.</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Founded in Eldoret City, Brighten Lighting was born out of a passion for cinematic aesthetics and premium interior design. We believe that lighting is not just functional—it is the soul of any space.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              Our curated collection brings together the finest materials, innovative LED technology, and timeless designs to help you create environments that inspire, comfort, and wow.
            </p>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full opacity-50 -z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=1000" 
              alt="Brighten Lighting Showroom" 
              className="rounded-2xl border border-white/10 shadow-2xl"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-dark-lighter rounded-3xl p-12 border border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Our Core Values</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">The principles that guide everything we do, from curating products to serving our customers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "Uncompromising Quality", desc: "We source only the highest grade materials for lasting durability." },
              { icon: Lightbulb, title: "Innovative Design", desc: "Always at the forefront of modern lighting trends and technology." },
              { icon: Users, title: "Customer First", desc: "Dedicated to providing exceptional service and expert guidance." },
              { icon: Globe, title: "Sustainability", desc: "Promoting energy-efficient LED solutions for a greener planet." },
            ].map((value, idx) => (
              <div key={idx} className="bg-dark p-8 rounded-2xl border border-white/5 hover:border-gold/30 transition-colors group">
                <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <value.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-xl font-serif text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
