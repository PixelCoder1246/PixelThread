'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Sparkles,
  FileEdit,
  BarChart3,
  Search,
  Users,
  Palette,
  ChevronDown,
  ArrowRight,
  PenLine,
  BookOpen,
  Zap,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { analyticsService } from '@/services/analytics';
import { postsService } from '@/services/posts';
import { formatRelativeDate, calculateReadingTime } from '@/lib/utils';
import type { AdminAnalytics, Post } from '@/types';
import styles from './page.module.css';

/* ─── Animation Variants ─── */
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeInUpFast = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ─── Number formatter ─── */
function formatCompact(num: number): string {
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}

/* ─── Animated Counter ─── */
function AnimatedCounter({
  end,
  suffix = '',
  duration = 2000,
  compact = false,
}: {
  end: number;
  suffix?: string;
  duration?: number;
  compact?: boolean;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    let raf: number;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {compact ? formatCompact(count) : count}
      {suffix}
    </span>
  );
}

/* ─── Typing Animation ─── */
const AI_RESPONSE_TEXT =
  'PixelThread is an AI-powered platform that helps you create engaging content effortlessly. Our smart editor understands your writing style and suggests improvements in real time, from grammar tweaks to full paragraph rewrites. Whether you are drafting a technical tutorial or a personal essay, the AI adapts to your voice and helps you express ideas more clearly. Start writing and let the AI handle the rest.';

const AI_LINES = [
  {
    role: 'user',
    text: 'Write an intro for a blog post about AI and creativity',
  },
  { role: 'ai', text: '' },
];

function TypingAnimation() {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true);
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayedText(AI_RESPONSE_TEXT.slice(0, i));
        if (i >= AI_RESPONSE_TEXT.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 20);

      return () => clearInterval(interval);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className={styles.aiShowcaseLine}>
        <PenLine
          size={14}
          style={{ color: 'var(--text-tertiary)', marginTop: 4, flexShrink: 0 }}
        />
        <span className={styles.aiShowcasePrompt}>{AI_LINES[0].text}</span>
      </div>
      <div className={styles.aiShowcaseLine}>
        <Zap
          size={14}
          style={{ color: 'var(--primary-400)', marginTop: 4, flexShrink: 0 }}
        />
        <div className={styles.aiShowcaseResponse}>
          <span>
            {displayedText}
            {isTyping && <span className={styles.aiShowcaseCursor} />}
          </span>
        </div>
      </div>
    </>
  );
}

/* ─── Feature Data ─── */
const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Writing Assistant',
    description:
      'Generate outlines, rewrite paragraphs, and polish your prose with context-aware AI that adapts to your voice.',
  },
  {
    icon: FileEdit,
    title: 'Rich Text Editor',
    description:
      'A distraction-free editor with markdown support, slash commands, and real-time collaboration features.',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description:
      'Understand your audience with detailed insights on views, read time, engagement, and content performance.',
  },
  {
    icon: Search,
    title: 'SEO Optimized',
    description:
      'Built-in SEO tools analyze your content and suggest improvements to help your posts rank higher in search.',
  },
  {
    icon: Users,
    title: 'Community Engagement',
    description:
      'Build a following with comments, likes, and shares. Foster meaningful discussions around your content.',
  },
  {
    icon: Palette,
    title: 'Custom Branding',
    description:
      'Personalize your profile and posts with custom themes, domains, and a consistent brand identity.',
  },
];

/* ─── Testimonial Data ─── */
const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Tech Blogger',
    avatar: 'SC',
    quote:
      'PixelThread transformed my writing workflow. The AI suggestions feel like having a co-editor who actually gets my style. I publish twice as often now.',
  },
  {
    name: 'Marcus Rivera',
    role: 'Content Creator',
    avatar: 'MR',
    quote:
      'The analytics alone are worth it. I can see exactly what resonates with my audience and tailor my content strategy accordingly.',
  },
  {
    name: 'Emily Watson',
    role: 'Freelance Writer',
    avatar: 'EW',
    quote:
      'I have tried dozens of writing platforms. PixelThread is the first one that combines beautiful design with genuinely useful AI features.',
  },
  {
    name: 'James Kim',
    role: 'Startup Founder',
    avatar: 'JK',
    quote:
      'We use PixelThread for our company blog. The collaboration features and SEO tools have helped us grow our organic traffic by 300%.',
  },
  {
    name: 'Priya Patel',
    role: 'Academic Writer',
    avatar: 'PP',
    quote:
      'The distraction-free environment and smart organization tools make it perfect for long-form writing projects.',
  },
];

/* ─── FAQ Data ─── */
const FAQS = [
  {
    question: 'What is PixelThread?',
    answer:
      'PixelThread is an AI-powered blogging platform that helps writers create, publish, and grow their audience. It combines a beautiful editor with smart AI tools to make writing faster and more enjoyable.',
  },
  {
    question: 'How does the AI writing assistant work?',
    answer:
      'Our AI analyzes your writing context and offers real-time suggestions for improvements, rewrites, and expansions. It can generate outlines, suggest headlines, help with research, and polish your prose while maintaining your unique voice.',
  },
  {
    question: 'Is my content private and secure?',
    answer:
      'Absolutely. Your content belongs to you. We use industry-standard encryption for data in transit and at rest. You control who sees your posts with granular privacy settings.',
  },
  {
    question: 'Can I import existing blog posts?',
    answer:
      'Yes! PixelThread supports importing from Medium, WordPress, and other major platforms. We also support Markdown import and have a rich API for custom migrations.',
  },
  {
    question: 'What kind of support do you offer?',
    answer:
      'All users have access to email support. We strive to respond to all inquiries within 24 hours.',
  },
  {
    question: 'Can I use my own domain?',
    answer:
      'Yes, Pro and Enterprise plans support custom domains with automatic SSL certificates. You can publish your blog on your own domain while leveraging all of PixelThread features.',
  },
];

/* ─── Section Wrapper ─── */
function SectionWrapper({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger}
    >
      {children}
    </motion.section>
  );
}

import { useGuestOnly } from '@/hooks/useAuth';

/* ─── Main Page ─── */
export default function LandingPage() {
  useGuestOnly();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [publicPosts, setPublicPosts] = useState<Post[]>([]);

  useEffect(() => {
    analyticsService
      .getPublicAnalytics()
      .then(setAnalytics)
      .catch(() => setAnalytics(null));

    postsService
      .getAll({ page: 1, limit: 6 })
      .then((res) => {
        if (Array.isArray(res?.posts)) {
          setPublicPosts(res.posts);
        }
      })
      .catch(() => {});
  }, []);

  const totalUsers = analytics?.totalUsers ?? 0;
  const totalPosts = analytics?.totalPosts ?? 0;

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <div className={styles.heroGlow} />

        <motion.div
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div className={styles.heroBadge} variants={fadeInUpFast}>
            <span className={styles.heroBadgeDot} />A platform for thoughtful
            writing
          </motion.div>

          <motion.h1 className={styles.heroTitle} variants={fadeInUp}>
            Where ideas come{' '}
            <span className={styles.heroTitleGradient}>to life</span>
          </motion.h1>

          <motion.p className={styles.heroDescription} variants={fadeInUp}>
            PixelThread is the modern blogging platform for thinkers, creators,
            and engineers. Read insightful stories, publish with intelligent AI
            tools, and grow your audience.
          </motion.p>

          <motion.div className={styles.heroActions} variants={fadeInUp}>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => router.push('/feed')}
            >
              Explore Feed & Posts
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/register')}
            >
              Start Writing Free
            </Button>
          </motion.div>

          <motion.div className={styles.heroStats} variants={fadeInUp}>
            <div className={styles.heroStat}>
              <div className={styles.heroStatValue}>
                {formatCompact(totalUsers)}+
              </div>
              <div className={styles.heroStatLabel}>Active writers</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.heroStatValue}>
                {formatCompact(totalPosts)}+
              </div>
              <div className={styles.heroStatLabel}>Stories published</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ LATEST STORIES FOR ALL VISITORS ═══ */}
      <SectionWrapper
        className={`${styles.section} ${styles.storiesSection}`}
        id="latest-stories"
      >
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionHeader} variants={fadeInUp}>
            <span className={styles.sectionTag}>Community Feed</span>
            <h2 className={styles.sectionTitle}>Featured & Recent Stories</h2>
            <p className={styles.sectionDescription}>
              Explore fresh perspectives, deep dives, and ideas published by
              writers across PixelThread.
            </p>
          </motion.div>

          <motion.div className={styles.storiesGrid} variants={stagger}>
            {publicPosts.length > 0 ? (
              publicPosts.map((post) => {
                const readingTime = calculateReadingTime(
                  post.content || post.excerpt || ''
                );
                return (
                  <motion.article
                    key={post.id || post.slug}
                    className={styles.storyCard}
                    variants={fadeInUp}
                    onClick={() => router.push(`/posts/${post.slug}`)}
                  >
                    <div className={styles.storyMeta}>
                      <div className={styles.storyAuthor}>
                        <Avatar
                          src={post.author.image ?? undefined}
                          name={post.author.name}
                          size="sm"
                        />
                        <span className={styles.storyAuthorName}>
                          {post.author.name}
                        </span>
                      </div>
                      <span className={styles.storyDate}>
                        {formatRelativeDate(post.publishedAt ?? post.createdAt)}{' '}
                        · {readingTime} min read
                      </span>
                    </div>

                    <h3 className={styles.storyTitle}>{post.title}</h3>
                    {post.excerpt && (
                      <p className={styles.storyExcerpt}>{post.excerpt}</p>
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className={styles.storyTags}>
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag.id || tag.name}
                            variant="default"
                            size="sm"
                          >
                            #{tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.article>
                );
              })
            ) : (
              <div className={styles.emptyStoriesPlaceholder}>
                <p>
                  No stories published yet. Be the first to publish on
                  PixelThread!
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/register')}
                  style={{ marginTop: '12px' }}
                >
                  Write First Story
                </Button>
              </div>
            )}
          </motion.div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <Button
              variant="secondary"
              size="md"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => router.push('/feed')}
            >
              Browse Full Feed
            </Button>
          </div>
        </div>
      </SectionWrapper>

      {/* ═══ FEATURES ═══ */}
      <SectionWrapper
        className={`${styles.section} ${styles.features}`}
        id="features"
      >
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionHeader} variants={fadeInUp}>
            <span className={styles.sectionTag}>Features</span>
            <h2 className={styles.sectionTitle}>
              Everything you need to create great content
            </h2>
            <p className={styles.sectionDescription}>
              Powerful tools that work together to help you write better,
              publish faster, and grow your audience.
            </p>
          </motion.div>

          <motion.div className={styles.featuresGrid} variants={stagger}>
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className={styles.featureCard}
                  variants={fadeInUp}
                >
                  <div className={styles.featureIcon}>
                    <Icon size={22} />
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ═══ AI SHOWCASE ═══ */}
      <SectionWrapper className={`${styles.section} ${styles.aiShowcase}`}>
        <div className={styles.aiShowcaseBg} />
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionHeader} variants={fadeInUp}>
            <span className={styles.sectionTag}>AI Powered</span>
            <h2 className={styles.sectionTitle}>See the AI in action</h2>
            <p className={styles.sectionDescription}>
              Our AI understands context and helps you craft compelling content
              in real time.
            </p>
          </motion.div>

          <motion.div className={styles.aiShowcaseCard} variants={fadeInUp}>
            <div className={styles.aiShowcaseHeader}>
              <span
                className={`${styles.aiShowcaseDot} ${styles.aiShowcaseDotRed}`}
              />
              <span
                className={`${styles.aiShowcaseDot} ${styles.aiShowcaseDotYellow}`}
              />
              <span
                className={`${styles.aiShowcaseDot} ${styles.aiShowcaseDotGreen}`}
              />
              <span className={styles.aiShowcaseLabel}>
                AI Assistant — pixelthread.app
              </span>
            </div>
            <div className={styles.aiShowcaseBody}>
              <TypingAnimation />
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ═══ STATISTICS ═══ */}
      <SectionWrapper className={`${styles.section} ${styles.statistics}`}>
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionHeader} variants={fadeInUp}>
            <span className={styles.sectionTag}>Statistics</span>
            <h2 className={styles.sectionTitle}>
              Trusted by creators worldwide
            </h2>
            <p className={styles.sectionDescription}>
              Join a growing community of writers who choose PixelThread to
              share their ideas.
            </p>
          </motion.div>

          <motion.div className={styles.statsGrid} variants={stagger}>
            <motion.div className={styles.statCard} variants={fadeInUp}>
              <div className={styles.statIcon}>
                <BookOpen size={22} />
              </div>
              <div className={styles.statValue}>
                <AnimatedCounter end={totalPosts} compact />
              </div>
              <div className={styles.statLabel}>Posts created</div>
            </motion.div>
            <motion.div className={styles.statCard} variants={fadeInUp}>
              <div className={styles.statIcon}>
                <Users size={22} />
              </div>
              <div className={styles.statValue}>
                <AnimatedCounter end={totalUsers} compact />
              </div>
              <div className={styles.statLabel}>Active writers</div>
            </motion.div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ═══ TESTIMONIALS ═══ */}
      <SectionWrapper className={`${styles.section} ${styles.testimonials}`}>
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionHeader} variants={fadeInUp}>
            <span className={styles.sectionTag}>Testimonials</span>
            <h2 className={styles.sectionTitle}>Loved by writers</h2>
            <p className={styles.sectionDescription}>
              Hear from the creators who use PixelThread every day.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <TestimonialCarousel />
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ═══ FAQ ═══ */}
      <SectionWrapper className={`${styles.section} ${styles.faq}`} id="faq">
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionHeader} variants={fadeInUp}>
            <span className={styles.sectionTag}>FAQ</span>
            <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
            <p className={styles.sectionDescription}>
              Everything you need to know about PixelThread.
            </p>
          </motion.div>

          <motion.div className={styles.faqList} variants={stagger}>
            {FAQS.map((faq) => (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ═══ CTA ═══ */}
      <section className={styles.cta}>
        <div className={styles.ctaBg} />
        <div className={styles.ctaGlow} />
        <div className={styles.ctaInner}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h2 className={styles.ctaTitle}>
              Ready to bring your ideas to life?
            </h2>
            <p className={styles.ctaDescription}>
              Join thousands of creators already using PixelThread. Start
              writing for free, no credit card required.
            </p>
            <div className={styles.ctaActions}>
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight size={16} />}
                onClick={() => router.push('/register')}
              >
                Get Started Free
              </Button>
              <Link href="#features" scroll>
                <span className={styles.heroActionSecondary}>See Features</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

/* ─── Testimonial Carousel ─── */
function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((index: number) => {
    trackRef.current?.children[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
    setActiveIndex(index);
  }, []);

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const scrollLeft = track.scrollLeft;
    const cardWidth = track.children[0]?.getBoundingClientRect().width ?? 0;
    const gap = 24;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(index, TESTIMONIALS.length - 1));
  }, []);

  return (
    <div>
      <div
        className={styles.testimonialsTrack}
        ref={trackRef}
        onScroll={handleScroll}
      >
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className={styles.testimonialCard}>
            <p className={styles.testimonialQuote}>{t.quote}</p>
            <div className={styles.testimonialAuthor}>
              <div
                className={styles.testimonialAvatarFallback}
                style={{ background: 'var(--gradient-primary)' }}
              >
                {t.avatar}
              </div>
              <div className={styles.testimonialInfo}>
                <span className={styles.testimonialName}>{t.name}</span>
                <span className={styles.testimonialRole}>{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.testimonialsDots}>
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            className={`${styles.testimonialDot} ${i === activeIndex ? styles.testimonialDotActive : ''}`}
            onClick={() => scrollTo(i)}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── FAQ Item ─── */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div className={styles.faqItem} variants={fadeInUpFast}>
      <button
        type="button"
        className={styles.faqTrigger}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <ChevronDown
          size={18}
          className={`${styles.faqChevron} ${open ? styles.faqChevronOpen : ''}`}
        />
      </button>
      <div
        className={`${styles.faqContent} ${open ? styles.faqContentOpen : ''}`}
      >
        <p className={styles.faqAnswer}>{answer}</p>
      </div>
    </motion.div>
  );
}
