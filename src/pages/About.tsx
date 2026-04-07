import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, Award, Users, Globe, ArrowRight, Target, Eye, Heart, Mail, Phone, MapPin, Linkedin } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To empower individuals and businesses with innovative financial solutions that drive growth and prosperity.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    description: 'To be the most trusted and customer-centric bank, setting the standard for excellence in digital banking.',
  },
  {
    icon: Heart,
    title: 'Our Values',
    description: 'Integrity, innovation, and customer focus guide every decision we make and every service we deliver.',
  },
];

const milestones = [
  { year: '1974', event: 'Founded as a community bank' },
  { year: '1995', event: 'Launched online banking services' },
  { year: '2008', event: 'Expanded to 50 branches nationwide' },
  { year: '2015', event: 'Introduced mobile banking app' },
  { year: '2020', event: 'Reached 1 million customers' },
  { year: '2024', event: 'Surpassed $50B in assets' },
];

const team = [
  {
    name: 'James Whitfield',
    role: 'Chief Executive Officer',
    bio: '25+ years in financial services leadership. Former VP at Goldman Sachs. MBA from Wharton School of Business.',
    initials: 'JW',
  },
  {
    name: 'Dr. Amara Osei',
    role: 'Chief Risk Officer',
    bio: 'Ph.D. in Financial Economics. 18 years of risk management experience at top-tier institutions. Certified Financial Risk Manager (FRM).',
    initials: 'AO',
  },
  {
    name: 'Michael Torres',
    role: 'Chief Technology Officer',
    bio: 'Former engineering director at Stripe. Expert in fintech security and scalable banking infrastructure. MS in Computer Science, MIT.',
    initials: 'MT',
  },
  {
    name: 'Emily Chang',
    role: 'Chief Compliance Officer',
    bio: '20 years in banking regulation and compliance. Former examiner at FDIC. Juris Doctor from Columbia Law School.',
    initials: 'EC',
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
                About MorganFinance Bank
              </h1>
              <p className="text-lg text-muted-foreground">
                For over 50 years, we've been committed to providing exceptional banking services built on trust, innovation, and customer focus.
              </p>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-elegant">
                    <value.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-serif font-bold mb-6">Our Story</h2>
                <p className="text-muted-foreground mb-4">
                  MorganFinance Bank was founded in 1974 with a simple mission: to provide personalized banking services to our local community. What started as a single branch has grown into a nationwide institution serving over 2 million customers.
                </p>
                <p className="text-muted-foreground mb-4">
                  Throughout our journey, we've remained committed to our founding principles while embracing innovation. We were among the first to offer online banking in the 90s and continue to lead in digital banking technology today.
                </p>
                <p className="text-muted-foreground mb-8">
                  Today, MorganFinance Bank is recognized as one of the most trusted financial institutions, managing over $50 billion in assets while maintaining the personal touch that defines who we are.
                </p>
                <Button className="gradient-primary shadow-elegant" asChild>
                  <Link to="/register">
                    Join Our Family <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>

              <div className="bg-card rounded-3xl p-8 shadow-elegant border border-border">
                <h3 className="text-xl font-serif font-semibold mb-6">Key Milestones</h3>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.year} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="w-16 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold text-sm">{milestone.year}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{milestone.event}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-serif font-bold mb-4">Leadership Team</h2>
              <p className="text-muted-foreground">
                Our experienced leadership brings decades of combined expertise in banking, technology, risk management, and regulatory compliance.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <div
                  key={member.name}
                  className="bg-card rounded-2xl p-6 border border-border hover:shadow-elegant transition-all animate-fade-in text-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
                    {member.initials}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Regulatory & Compliance */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl font-serif font-bold mb-4">Regulatory Compliance</h2>
              <p className="text-muted-foreground text-sm">
                MorganFinance Bank operates under full regulatory oversight and maintains the highest compliance standards.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { title: 'FDIC Member', desc: 'Deposits insured up to $250,000 per depositor.' },
                { title: 'NMLS# 123456', desc: 'Registered with Nationwide Multistate Licensing System.' },
                { title: 'Equal Housing Lender', desc: 'We comply with all fair lending laws and regulations.' },
              ].map((item) => (
                <div key={item.title} className="bg-card rounded-xl p-6 border border-border text-center">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-serif font-bold mb-4">Recognition & Awards</h2>
              <p className="text-muted-foreground">
                Our commitment to excellence has been recognized by industry leaders worldwide.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Award, title: 'Best Digital Bank', org: 'Banking Awards 2024' },
                { icon: Shield, title: 'Most Secure Bank', org: 'Security Council' },
                { icon: Users, title: 'Customer Choice', org: 'Consumer Reports' },
                { icon: Globe, title: 'Global Excellence', org: 'Finance Today' },
              ].map((award, index) => (
                <div
                  key={award.title}
                  className="bg-card rounded-2xl p-6 text-center border border-border hover:shadow-elegant transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center mx-auto mb-4 shadow-gold">
                    <award.icon className="w-6 h-6 text-gold-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{award.title}</h3>
                  <p className="text-xs text-muted-foreground">{award.org}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Details */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl font-serif font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground text-sm">
                We're here to help. Reach out through any of the channels below.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <Phone className="w-6 h-6 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground text-sm mb-1">Phone</h3>
                <p className="text-sm text-muted-foreground">+1 (800) 123-4567</p>
                <p className="text-xs text-muted-foreground mt-1">Available 24/7</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <Mail className="w-6 h-6 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground text-sm mb-1">Email</h3>
                <p className="text-sm text-muted-foreground">support@securebank.com</p>
                <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <MapPin className="w-6 h-6 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground text-sm mb-1">Office</h3>
                <p className="text-sm text-muted-foreground">123 Financial District</p>
                <p className="text-xs text-muted-foreground mt-1">Mon–Fri, 9 AM – 5 PM</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;