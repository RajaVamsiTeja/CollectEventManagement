import { motion } from "framer-motion";
import { GraduationCap, Target, Award, Users, BookOpen, Lightbulb, Building2 } from "lucide-react";

export default function About() {
  const stats = [
    { icon: Users, label: "Students", value: "5,000+" },
    { icon: BookOpen, label: "Courses", value: "60+" },
    { icon: Award, label: "Events/Year", value: "100+" },
    { icon: Building2, label: "Departments", value: "12" },
  ];

  const values = [
    { icon: Target, title: "Our Mission", desc: "To foster a vibrant campus culture through events that inspire learning, creativity, and community engagement." },
    { icon: Lightbulb, title: "Innovation", desc: "We encourage students to think beyond the classroom through hackathons, workshops, and tech fests." },
    { icon: Award, title: "Excellence", desc: "Our events are designed to challenge students and celebrate outstanding achievements." },
    { icon: Users, title: "Community", desc: "Building lasting connections through cultural events, sports, and collaborative activities." },
  ];

  return (
    <div>
      <section className="relative bg-gradient-to-br from-brand-700 to-accent-600 text-white py-20">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?w=1600')",
          backgroundSize: "cover",
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-white/80" />
            <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">About Our College</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              A premier institution dedicated to academic excellence, innovation, and holistic student development since 1985.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-6 text-center">
              <s.icon className="w-10 h-10 text-brand-500 mx-auto mb-3" />
              <p className="font-display font-bold text-3xl text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <v.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white">{v.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{v.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-4">Our Story</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Founded in 1985, our college has grown from a small engineering institute to a comprehensive educational institution
            offering programs across engineering, management, sciences, and arts. With over 5,000 students and 200+ faculty members,
            we pride ourselves on creating an environment where academic excellence meets cultural vibrancy. Our events program
            brings together students from all disciplines to learn, compete, celebrate, and create memories that last a lifetime.
          </p>
        </div>
      </section>
    </div>
  );
}
