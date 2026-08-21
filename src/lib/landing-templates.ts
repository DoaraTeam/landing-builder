import { ComponentConfig } from "@/types/landing";

export interface LandingPageTemplate {
  id: string;
  name: string;
  description: string;
  category: "business" | "saas" | "ecommerce" | "agency" | "portfolio";
  thumbnail?: string;
  components: Omit<ComponentConfig, "id" | "order">[];
}

export const landingPageTemplates: LandingPageTemplate[] = [
  {
    id: "modern-business",
    name: "Modern Business",
    description: "Professional business template with hero, features, and CTA",
    category: "business",
    components: [
      {
        type: "hero",
        visible: true,
        config: {
          title: "Transform Your Business Today",
          subtitle: "Innovation • Growth • Success",
          description:
            "We help businesses scale with cutting-edge solutions and expert guidance. Join thousands of satisfied clients worldwide.",
          primaryCTA: {
            text: "Get Started Free",
            link: "#contact",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Watch Demo",
            link: "#demo",
            style: "secondary" as const,
          },
          image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800",
          alignment: "center" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 800,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "logo-cloud",
        visible: true,
        config: {
          title: "Trusted by Leading Companies Worldwide",
          subtitle: "Join 10,000+ businesses that trust us",
          logos: [
            {
              name: "Microsoft",
              url: "https://via.placeholder.com/150x50/0078D4/FFF?text=Microsoft",
              link: "#",
            },
            {
              name: "Google",
              url: "https://via.placeholder.com/150x50/4285F4/FFF?text=Google",
              link: "#",
            },
            {
              name: "Amazon",
              url: "https://via.placeholder.com/150x50/FF9900/FFF?text=Amazon",
              link: "#",
            },
            {
              name: "IBM",
              url: "https://via.placeholder.com/150x50/054ADA/FFF?text=IBM",
              link: "#",
            },
            {
              name: "Oracle",
              url: "https://via.placeholder.com/150x50/F80000/FFF?text=Oracle",
              link: "#",
            },
            {
              name: "Salesforce",
              url: "https://via.placeholder.com/150x50/00A1E0/FFF?text=Salesforce",
              link: "#",
            },
          ],
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          spacing: {
            padding: "lg" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "features",
        visible: true,
        config: {
          title: "Powerful Features for Your Business",
          subtitle: "Everything you need to succeed",
          description:
            "Comprehensive solutions designed for modern businesses to streamline operations and drive growth",
          features: [
            {
              id: "1",
              title: "Lightning Fast Performance",
              description:
                "Experience blazing-fast load times and real-time data synchronization. Our optimized infrastructure ensures 99.9% uptime with millisecond response times.",
              icon: "⚡",
              image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
            },
            {
              id: "2",
              title: "Enterprise Security",
              description:
                "Bank-level encryption, SOC 2 Type II certified, GDPR compliant. Multi-factor authentication, role-based access control, and regular security audits keep your data safe.",
              icon: "🔒",
              image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400",
            },
            {
              id: "3",
              title: "24/7 Expert Support",
              description:
                "Round-the-clock support from our expert team via phone, email, and live chat. Get answers within minutes with our 99% customer satisfaction rating.",
              icon: "💬",
              image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400",
            },
            {
              id: "4",
              title: "Seamless Integration",
              description:
                "Connect with 500+ popular tools and apps. Pre-built integrations with Slack, Salesforce, HubSpot, Zapier, and more. REST API and webhooks for custom integrations.",
              icon: "🔗",
              image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400",
            },
            {
              id: "5",
              title: "Advanced Analytics",
              description:
                "Real-time dashboards, custom reports, and predictive analytics. Track KPIs, identify trends, and make data-driven decisions with actionable insights.",
              icon: "📊",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
            },
            {
              id: "6",
              title: "Infinite Scalability",
              description:
                "Scale from 10 to 10,000+ users seamlessly. Auto-scaling infrastructure, unlimited storage, and no performance degradation as your business grows.",
              icon: "📈",
              image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400",
            },
          ],
          layout: "grid" as const,
          columns: 3,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 100,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "stats",
        visible: true,
        config: {
          title: "Trusted by Businesses Worldwide",
          subtitle: "PROVEN TRACK RECORD",
          description: "Numbers that speak for themselves",
          stats: [
            {
              id: "1",
              value: "10K",
              label: "Active Customers",
              suffix: "+",
              prefix: "",
            },
            {
              id: "2",
              value: "99.9",
              label: "Uptime SLA",
              suffix: "%",
              prefix: "",
            },
            {
              id: "3",
              value: "4.9",
              label: "Customer Rating",
              suffix: "/5",
              prefix: "",
            },
            {
              id: "4",
              value: "150",
              label: "Countries Served",
              suffix: "+",
              prefix: "",
            },
          ],
          layout: "grid" as const,
          columns: 4,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "content",
        visible: true,
        config: {
          title: "Built for Modern Teams",
          subtitle: "COLLABORATION MADE EASY",
          content:
            "Empower your team with tools designed for seamless collaboration. From project management to real-time communication, everything you need is in one place. Share files, track progress, and stay aligned with your team's goals effortlessly.",
          image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
          imagePosition: "right" as const,
          features: [
            "Real-time collaboration tools",
            "Project management dashboard",
            "Team communication channels",
            "File sharing and version control",
            "Task automation workflows",
            "Performance tracking metrics",
          ],
          cta: {
            text: "Explore Team Features",
            link: "#features",
          },
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "pricing",
        visible: true,
        config: {
          title: "Simple, Transparent Pricing",
          subtitle: "Choose the plan that's right for you",
          description: "No hidden fees. Cancel anytime.",
          plans: [
            {
              id: "1",
              name: "Starter",
              price: "$29",
              period: "/month",
              description: "Perfect for small businesses",
              features: [
                "Up to 10 users",
                "5GB storage",
                "Basic support",
                "Email integration",
                "Mobile app access",
              ],
              cta: {
                text: "Start Free Trial",
                link: "#signup",
              },
              highlighted: false,
            },
            {
              id: "2",
              name: "Professional",
              price: "$79",
              period: "/month",
              description: "For growing teams",
              features: [
                "Up to 50 users",
                "100GB storage",
                "Priority support",
                "Advanced analytics",
                "API access",
                "Custom integrations",
              ],
              cta: {
                text: "Get Started",
                link: "#signup",
              },
              highlighted: true,
              badge: "Most Popular",
            },
            {
              id: "3",
              name: "Enterprise",
              price: "$199",
              period: "/month",
              description: "For large organizations",
              features: [
                "Unlimited users",
                "Unlimited storage",
                "24/7 phone support",
                "Dedicated account manager",
                "Custom development",
                "SLA guarantee",
                "On-premise deployment",
              ],
              cta: {
                text: "Contact Sales",
                link: "#contact",
              },
              highlighted: false,
            },
          ],
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "testimonials",
        visible: true,
        config: {
          title: "What Our Clients Say",
          subtitle: "CUSTOMER TESTIMONIALS",
          description: "Real feedback from real customers who love our platform",
          testimonials: [
            {
              id: "1",
              content:
                "This platform has transformed how we do business. The ROI was evident within the first month! Our team productivity increased by 40% and customer satisfaction scores jumped to 98%.",
              author: "Sarah Johnson",
              role: "CEO",
              company: "TechCorp Inc.",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=1",
            },
            {
              id: "2",
              content:
                "Outstanding support team and incredibly powerful features. The analytics dashboard alone has saved us 20 hours per week. Integration with our existing tools was seamless.",
              author: "Michael Chen",
              role: "Marketing Director",
              company: "GrowthLabs",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=2",
            },
            {
              id: "3",
              content:
                "We've tried many solutions, but this one stands out. It's simply the best in the market. Helped us scale from 10 to 500 customers without any hiccups.",
              author: "Emily Rodriguez",
              role: "Product Manager",
              company: "InnovateCo",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=3",
            },
            {
              id: "4",
              content:
                "The automation features have been a game-changer for us. We've reduced manual tasks by 70% and can now focus on strategic initiatives that drive growth.",
              author: "David Park",
              role: "Operations Manager",
              company: "Global Solutions Ltd",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=10",
            },
            {
              id: "5",
              content:
                "Security and compliance were our top priorities. This platform exceeded our expectations with SOC 2 certification and comprehensive audit logs.",
              author: "Lisa Anderson",
              role: "CTO",
              company: "Innovation Labs",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=12",
            },
            {
              id: "6",
              content:
                "Our sales team loves the mobile app and real-time notifications. Response times improved by 60% and deal closure rates are up 35%. Incredible results!",
              author: "James Wilson",
              role: "VP of Sales",
              company: "Enterprise Systems",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=15",
            },
          ],
          layout: "grid" as const,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "faq",
        visible: true,
        config: {
          title: "Frequently Asked Questions",
          subtitle: "GOT QUESTIONS?",
          description: "Find answers to common questions about our platform",
          faqs: [
            {
              id: "1",
              question: "How long does it take to get started?",
              answer:
                "You can start using our platform immediately after signing up. Our intuitive onboarding process takes less than 5 minutes, and you'll have access to all features right away. We also provide guided tours and video tutorials to help you get up to speed quickly.",
            },
            {
              id: "2",
              question: "Can I migrate my existing data?",
              answer:
                "Yes! We provide free data migration services for all paid plans. Our team will work with you to ensure a smooth transition from your current system. We support imports from CSV, Excel, and direct integrations with popular platforms like Salesforce, HubSpot, and more.",
            },
            {
              id: "3",
              question: "What kind of support do you offer?",
              answer:
                "We offer 24/7 support via live chat, email, and phone for all paid plans. Free plan users have access to our comprehensive knowledge base and community forum. Enterprise customers get a dedicated account manager and priority support with guaranteed response times.",
            },
            {
              id: "4",
              question: "Is my data secure?",
              answer:
                "Absolutely. We use bank-level 256-bit encryption, are SOC 2 Type II certified, and fully GDPR compliant. Your data is stored in secure data centers with redundant backups. We also provide single sign-on (SSO), two-factor authentication, and detailed audit logs.",
            },
            {
              id: "5",
              question: "Can I cancel my subscription anytime?",
              answer:
                "Yes, you can cancel your subscription at any time with no penalties or fees. You'll continue to have access until the end of your billing period. We also offer a 30-day money-back guarantee if you're not completely satisfied with our service.",
            },
            {
              id: "6",
              question: "Do you offer custom integrations?",
              answer:
                "Yes! We have a robust REST API and webhooks for custom integrations. Our developer documentation is comprehensive and includes code examples in multiple languages. Enterprise plans include dedicated integration support and custom development services.",
            },
            {
              id: "7",
              question: "What payment methods do you accept?",
              answer:
                "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and wire transfers for annual subscriptions. Enterprise customers can also set up invoicing with NET 30 payment terms.",
            },
            {
              id: "8",
              question: "Is there a limit on team members or users?",
              answer:
                "Free plans include up to 5 users. Professional plans support up to 50 users, and Business plans up to 500 users. Enterprise plans offer unlimited users with custom pricing based on your specific needs. All plans allow you to add or remove users at any time.",
            },
          ],
          layout: "accordion" as const,
          columns: 2,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "cta",
        visible: true,
        config: {
          title: "Ready to Get Started?",
          description:
            "Join thousands of successful businesses using our platform. Start your free trial today!",
          primaryCTA: {
            text: "Start Free Trial",
            link: "#signup",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Schedule Demo",
            link: "#demo",
            style: "outline" as const,
          },
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "footer",
        visible: true,
        config: {
          logo: {
            text: "YourBrand",
            image: "",
          },
          description: "Building the future of business technology.",
          links: [
            {
              title: "Product",
              items: [
                { text: "Features", link: "#features" },
                { text: "Pricing", link: "#pricing" },
                { text: "Security", link: "#security" },
                { text: "Updates", link: "#updates" },
              ],
            },
            {
              title: "Company",
              items: [
                { text: "About", link: "#about" },
                { text: "Blog", link: "#blog" },
                { text: "Careers", link: "#careers" },
                { text: "Contact", link: "#contact" },
              ],
            },
            {
              title: "Resources",
              items: [
                { text: "Documentation", link: "#docs" },
                { text: "Help Center", link: "#help" },
                { text: "Community", link: "#community" },
                { text: "API", link: "#api" },
              ],
            },
          ],
          social: [
            { platform: "facebook", link: "#", icon: "facebook" },
            { platform: "twitter", link: "#", icon: "twitter" },
            { platform: "linkedin", link: "#", icon: "linkedin" },
            { platform: "github", link: "#", icon: "github" },
          ],
          copyright: "© 2024 YourBrand. All rights reserved.",
        },
      },
    ],
  },
  {
    id: "saas-product",
    name: "SaaS Product",
    description: "Perfect for SaaS products with feature showcase and pricing",
    category: "saas",
    components: [
      {
        type: "hero",
        visible: true,
        config: {
          title: "The Ultimate SaaS Solution for Modern Teams",
          subtitle: "Powerful • Simple • Affordable",
          description:
            "Everything you need to run your business in one place. Streamline workflows, boost productivity, and scale effortlessly. No technical knowledge required - get started in minutes!",
          primaryCTA: {
            text: "Start Free 14-Day Trial",
            link: "#signup",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Watch Demo Video",
            link: "#demo",
            style: "secondary" as const,
          },
          image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
          alignment: "left" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 800,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "logo-cloud",
        visible: true,
        config: {
          title: "Trusted by 5,000+ Growing Companies",
          subtitle: "",
          logos: [
            {
              name: "Shopify",
              url: "https://via.placeholder.com/150x50/96BF48/FFF?text=Shopify",
              link: "#",
            },
            {
              name: "Stripe",
              url: "https://via.placeholder.com/150x50/635BFF/FFF?text=Stripe",
              link: "#",
            },
            {
              name: "Notion",
              url: "https://via.placeholder.com/150x50/000000/FFF?text=Notion",
              link: "#",
            },
            {
              name: "Figma",
              url: "https://via.placeholder.com/150x50/F24E1E/FFF?text=Figma",
              link: "#",
            },
            {
              name: "Slack",
              url: "https://via.placeholder.com/150x50/4A154B/FFF?text=Slack",
              link: "#",
            },
            {
              name: "Zoom",
              url: "https://via.placeholder.com/150x50/2D8CFF/FFF?text=Zoom",
              link: "#",
            },
          ],
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          spacing: {
            padding: "md" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "features",
        visible: true,
        config: {
          title: "Everything You Need to Succeed",
          subtitle: "POWERFUL FEATURES",
          description:
            "Built for modern teams who want to move fast without compromising on quality",
          features: [
            {
              id: "1",
              title: "Real-time Collaboration",
              description:
                "Work together seamlessly with your team in real-time. Share documents, co-edit files, and communicate instantly. See who's online and working on what with live presence indicators.",
              icon: "👥",
              image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
            },
            {
              id: "2",
              title: "Smart Automation",
              description:
                "Automate repetitive tasks and focus on what matters. Create custom workflows, set up triggers, and let the system handle routine operations. Save 10+ hours per week per team member.",
              icon: "🤖",
              image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400",
            },
            {
              id: "3",
              title: "Advanced Analytics",
              description:
                "Get insights with powerful analytics and reporting. Track KPIs, monitor performance metrics, and generate custom reports. Export data to Excel, PDF, or integrate with BI tools.",
              icon: "📊",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
            },
            {
              id: "4",
              title: "200+ Integrations",
              description:
                "Connect with all your favorite tools and apps. Pre-built integrations with Slack, Google Workspace, Salesforce, Zapier, and more. Full REST API for custom integrations.",
              icon: "🔌",
              image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400",
            },
            {
              id: "5",
              title: "Mobile Apps",
              description:
                "Work from anywhere with native iOS and Android apps. Full feature parity with desktop. Offline mode keeps you productive without internet connection. Push notifications for important updates.",
              icon: "📱",
              image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
            },
            {
              id: "6",
              title: "Enterprise Security",
              description:
                "Bank-level encryption, SOC 2 Type II certified, GDPR compliant. SSO, 2FA, role-based access control, and detailed audit logs. Your data is safe with us.",
              icon: "🔒",
              image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400",
            },
          ],
          layout: "grid" as const,
          columns: 3,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 100,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "stats",
        visible: true,
        config: {
          title: "Results That Speak for Themselves",
          subtitle: "BY THE NUMBERS",
          description: "See the impact we make on businesses worldwide",
          stats: [
            {
              id: "1",
              value: "5K",
              label: "Happy Customers",
              suffix: "+",
              prefix: "",
            },
            {
              id: "2",
              value: "10M",
              label: "Tasks Completed",
              suffix: "+",
              prefix: "",
            },
            {
              id: "3",
              value: "98",
              label: "Customer Satisfaction",
              suffix: "%",
              prefix: "",
            },
            {
              id: "4",
              value: "24",
              label: "Support Availability",
              suffix: "/7",
              prefix: "",
            },
          ],
          layout: "grid" as const,
          columns: 4,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "content",
        visible: true,
        config: {
          title: "Workflow Automation That Just Works",
          subtitle: "BOOST PRODUCTIVITY",
          content:
            "Say goodbye to repetitive manual tasks. Our intelligent automation engine learns from your team's behavior and suggests optimizations. Create complex workflows with our visual builder - no coding required. Connect triggers, actions, and conditions to automate anything from simple reminders to complex multi-step processes.",
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
          imagePosition: "left" as const,
          features: [
            "Visual workflow builder with drag & drop",
            "Pre-built automation templates",
            "Custom triggers and actions",
            "Conditional logic and branching",
            "Schedule automations or run on-demand",
            "Real-time monitoring and error handling",
          ],
          cta: {
            text: "Explore Automation",
            link: "#automation",
          },
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "testimonials",
        visible: true,
        config: {
          title: "Loved by Teams Worldwide",
          subtitle: "CUSTOMER SUCCESS STORIES",
          description: "Don't just take our word for it - hear from our customers",
          testimonials: [
            {
              id: "1",
              content:
                "Switching to this platform was the best decision we made this year. Our team productivity increased by 45% in just 2 months. The automation features alone save us 15 hours per week!",
              author: "Alex Thompson",
              role: "Head of Operations",
              company: "TechFlow Inc",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=33",
            },
            {
              id: "2",
              content:
                "Finally, a SaaS solution that actually delivers on its promises. The interface is intuitive, onboarding was seamless, and support team is incredibly responsive. We're all in!",
              author: "Maria Garcia",
              role: "CEO",
              company: "StartupHub",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=44",
            },
            {
              id: "3",
              content:
                "We evaluated 10+ tools before choosing this one. The analytics dashboard gives us insights we never had before, and the integrations work flawlessly. Worth every penny!",
              author: "James Kim",
              role: "VP of Marketing",
              company: "GrowthWorks",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=14",
            },
            {
              id: "4",
              content:
                "The mobile apps are fantastic - I can manage my entire workflow on the go. Real-time sync means I'm always up to date no matter which device I'm using. Game changer!",
              author: "Sophie Laurent",
              role: "Project Manager",
              company: "DesignStudio Pro",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=25",
            },
            {
              id: "5",
              content:
                "Security was our biggest concern when choosing a cloud solution. Their SOC 2 certification and robust access controls gave us the confidence we needed. No regrets!",
              author: "Robert Chang",
              role: "CTO",
              company: "SecureData Systems",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=52",
            },
            {
              id: "6",
              content:
                "Customer support is outstanding - they actually care about our success. Had a complex integration question and got a detailed response within 30 minutes. Impressive!",
              author: "Emma Wilson",
              role: "Operations Director",
              company: "CloudScale Partners",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=16",
            },
          ],
          layout: "grid" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "pricing",
        visible: true,
        config: {
          title: "Simple, Transparent Pricing",
          subtitle: "PLANS FOR EVERY TEAM",
          description:
            "All plans include 14-day free trial. No credit card required. Cancel anytime.",
          plans: [
            {
              id: "1",
              name: "Starter",
              price: "$0",
              period: "/month",
              description: "Perfect for individuals and small teams",
              features: [
                "Up to 5 team members",
                "3 projects",
                "10GB storage",
                "Basic features",
                "Community support",
                "Mobile apps",
              ],
              cta: {
                text: "Get Started Free",
                link: "#signup",
              },
              highlighted: false,
            },
            {
              id: "2",
              name: "Professional",
              price: "$49",
              period: "/month",
              description: "For growing teams that need more power",
              features: [
                "Up to 50 team members",
                "Unlimited projects",
                "100GB storage",
                "All features included",
                "Priority email support",
                "Advanced analytics",
                "API access",
                "Custom integrations",
              ],
              cta: {
                text: "Start Free Trial",
                link: "#signup",
              },
              highlighted: true,
              badge: "Most Popular",
            },
            {
              id: "3",
              name: "Enterprise",
              price: "$149",
              period: "/month",
              description: "For large organizations with advanced needs",
              features: [
                "Unlimited team members",
                "Unlimited everything",
                "1TB storage",
                "Everything in Pro",
                "24/7 phone support",
                "Dedicated account manager",
                "Custom development",
                "SLA guarantee",
                "On-premise deployment",
                "Advanced security",
              ],
              cta: {
                text: "Contact Sales",
                link: "#contact",
              },
              highlighted: false,
            },
          ],
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "faq",
        visible: true,
        config: {
          title: "Frequently Asked Questions",
          subtitle: "EVERYTHING YOU NEED TO KNOW",
          description: "Can't find the answer you're looking for? Contact our support team.",
          faqs: [
            {
              id: "1",
              question: "How does the free trial work?",
              answer:
                "You get full access to all Pro features for 14 days - no credit card required. You can upgrade, downgrade, or cancel anytime during or after the trial. If you don't upgrade, your account automatically converts to the free Starter plan.",
            },
            {
              id: "2",
              question: "Can I change plans later?",
              answer:
                "Absolutely! You can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated amount for the remainder of your billing cycle. If you downgrade, you'll receive a credit applied to your next bill.",
            },
            {
              id: "3",
              question: "What payment methods do you accept?",
              answer:
                "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and ACH bank transfers for annual plans. Enterprise customers can also request invoice billing with NET 30 terms.",
            },
            {
              id: "4",
              question: "How secure is my data?",
              answer:
                "Very secure. We use 256-bit AES encryption for data at rest and TLS 1.3 for data in transit. We're SOC 2 Type II certified, GDPR compliant, and regularly undergo third-party security audits. Your data is backed up hourly across multiple data centers.",
            },
            {
              id: "5",
              question: "Do you offer discounts for nonprofits or educational institutions?",
              answer:
                "Yes! We offer 50% discounts for registered nonprofits and educational institutions. Contact our sales team with proof of your nonprofit or educational status to get your discount code.",
            },
            {
              id: "6",
              question: "Can I import data from other tools?",
              answer:
                "Yes, we provide migration tools and support for importing data from most popular platforms. Our support team offers free white-glove migration service for Professional and Enterprise plans to ensure a smooth transition.",
            },
            {
              id: "7",
              question: "What's your uptime guarantee?",
              answer:
                "We guarantee 99.9% uptime for all paid plans, backed by our SLA. Enterprise plans get 99.99% uptime guarantee. We provide real-time status updates at status.yourcompany.com and will credit your account if we fail to meet our SLA commitments.",
            },
            {
              id: "8",
              question: "How does billing work for adding/removing users?",
              answer:
                "We use prorated billing. When you add users mid-cycle, you're charged the prorated amount for the remainder of the billing period. When you remove users, you receive a credit applied to your next bill. You can add or remove users anytime without penalties.",
            },
          ],
          layout: "accordion" as const,
          columns: 2,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "cta",
        visible: true,
        config: {
          title: "Ready to Transform Your Workflow?",
          description:
            "Join 5,000+ teams already using our platform. Start your free 14-day trial today - no credit card required.",
          primaryCTA: {
            text: "Get Started Free",
            link: "#signup",
            style: "primary" as const,
          },
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "footer",
        visible: true,
        config: {
          logo: {
            text: "SaaSApp",
            image: "",
          },
          description: "The all-in-one platform for modern teams.",
          links: [
            {
              title: "Product",
              items: [
                { text: "Features", link: "#features" },
                { text: "Pricing", link: "#pricing" },
                { text: "Changelog", link: "#changelog" },
              ],
            },
            {
              title: "Resources",
              items: [
                { text: "Documentation", link: "#docs" },
                { text: "Tutorials", link: "#tutorials" },
                { text: "API Reference", link: "#api" },
              ],
            },
            {
              title: "Company",
              items: [
                { text: "About", link: "#about" },
                { text: "Blog", link: "#blog" },
                { text: "Contact", link: "#contact" },
              ],
            },
          ],
          social: [
            { platform: "twitter", link: "#", icon: "twitter" },
            { platform: "github", link: "#", icon: "github" },
            { platform: "linkedin", link: "#", icon: "linkedin" },
          ],
          copyright: "© 2024 SaaSApp. All rights reserved.",
        },
      },
    ],
  },
  {
    id: "agency-creative",
    name: "Creative Agency",
    description: "Bold and creative template for agencies and studios",
    category: "agency",
    components: [
      {
        type: "hero",
        visible: true,
        config: {
          title: "Creative Agency That Delivers",
          subtitle: "Design • Develop • Deliver",
          description:
            "We create stunning digital experiences that captivate your audience and drive results.",
          primaryCTA: {
            text: "View Our Work",
            link: "#portfolio",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Get in Touch",
            link: "#contact",
            style: "outline" as const,
          },
          alignment: "center" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 1000,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "features",
        visible: true,
        config: {
          title: "Our Services",
          subtitle: "What we do best",
          description: "Full-service creative solutions",
          features: [
            {
              title: "Brand Identity",
              description: "Create memorable brands that stand out",
              icon: "🎨",
            },
            {
              title: "Web Development",
              description: "Build fast, beautiful websites",
              icon: "💻",
            },
            {
              title: "UI/UX Design",
              description: "Design experiences users love",
              icon: "✨",
            },
            {
              title: "Digital Marketing",
              description: "Grow your online presence",
              icon: "📱",
            },
            {
              title: "Content Creation",
              description: "Engage your audience with great content",
              icon: "📝",
            },
            {
              title: "Strategy",
              description: "Plan for success with data-driven insights",
              icon: "🎯",
            },
          ],
          layout: "grid" as const,
          columns: 3,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 100,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "testimonials",
        visible: true,
        config: {
          title: "Client Success Stories",
          subtitle: "We're proud of our work",
          description: "See what our clients have to say",
          testimonials: [
            {
              id: "1",
              content:
                "The team delivered beyond our expectations. Our website traffic increased by 300%!",
              author: "Alex Thompson",
              role: "Founder",
              company: "StartupXYZ",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=10",
            },
            {
              id: "2",
              content: "Professional, creative, and always on time. A pleasure to work with!",
              author: "Jessica Lee",
              role: "Marketing Lead",
              company: "BrandCo",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=11",
            },
            {
              id: "3",
              content: "They transformed our brand completely. The results speak for themselves.",
              author: "David Park",
              role: "CEO",
              company: "TechVentures",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=12",
            },
          ],
          layout: "carousel" as const,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "cta",
        visible: true,
        config: {
          title: "Let's Create Something Amazing",
          description: "Ready to take your brand to the next level? Get in touch with us today.",
          primaryCTA: {
            text: "Start Your Project",
            link: "#contact",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "See Portfolio",
            link: "#portfolio",
            style: "outline" as const,
          },
          background: {
            type: "solid" as const,
            color: "#000000",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "footer",
        visible: true,
        config: {
          logo: {
            text: "CreativeStudio",
            image: "",
          },
          description: "Crafting digital experiences since 2020.",
          links: [
            {
              title: "Services",
              items: [
                { text: "Branding", link: "#branding" },
                { text: "Web Design", link: "#web" },
                { text: "Marketing", link: "#marketing" },
              ],
            },
            {
              title: "Work",
              items: [
                { text: "Portfolio", link: "#portfolio" },
                { text: "Case Studies", link: "#cases" },
                { text: "Process", link: "#process" },
              ],
            },
            {
              title: "Connect",
              items: [
                { text: "Contact", link: "#contact" },
                { text: "Careers", link: "#careers" },
                { text: "Blog", link: "#blog" },
              ],
            },
          ],
          social: [
            { platform: "instagram", link: "#", icon: "instagram" },
            { platform: "twitter", link: "#", icon: "twitter" },
            { platform: "linkedin", link: "#", icon: "linkedin" },
          ],
          copyright: "© 2024 CreativeStudio. All rights reserved.",
        },
      },
    ],
  },
  {
    id: "ecommerce-store",
    name: "E-Commerce Store",
    description: "Perfect for online stores and product showcases",
    category: "ecommerce",
    components: [
      {
        type: "hero",
        visible: true,
        config: {
          title: "Shop The Latest Collection",
          subtitle: "Quality • Style • Value",
          description:
            "Discover amazing products at unbeatable prices. Free shipping on orders over $50.",
          primaryCTA: {
            text: "Shop Now",
            link: "#products",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "View Catalog",
            link: "#catalog",
            style: "outline" as const,
          },
          image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
          alignment: "left" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 800,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "features",
        visible: true,
        config: {
          title: "Why Shop With Us",
          subtitle: "Customer satisfaction is our priority",
          description: "Experience the best shopping journey",
          features: [
            {
              title: "Free Shipping",
              description: "Free delivery on all orders over $50",
              icon: "🚚",
            },
            {
              title: "Secure Payment",
              description: "100% secure payment with SSL encryption",
              icon: "💳",
            },
            {
              title: "30-Day Returns",
              description: "Easy returns within 30 days of purchase",
              icon: "↩️",
            },
            {
              title: "24/7 Support",
              description: "Dedicated customer support team",
              icon: "💬",
            },
            {
              title: "Quality Guarantee",
              description: "All products are quality checked",
              icon: "✓",
            },
            {
              title: "Best Prices",
              description: "Competitive prices with regular discounts",
              icon: "💰",
            },
          ],
          layout: "grid" as const,
          columns: 3,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 100,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "testimonials",
        visible: true,
        config: {
          title: "Happy Customers",
          subtitle: "See what our customers say",
          description: "Join thousands of satisfied shoppers",
          testimonials: [
            {
              id: "1",
              content: "Love the quality and fast shipping! Will definitely order again.",
              author: "Emma Wilson",
              role: "Verified Buyer",
              company: "Fashion Lover",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=5",
            },
            {
              id: "2",
              content: "Best online shopping experience. Great products and customer service!",
              author: "James Brown",
              role: "Verified Buyer",
              company: "Tech Enthusiast",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=6",
            },
            {
              id: "3",
              content: "Amazing deals and quick delivery. Highly recommend to everyone!",
              author: "Sophia Martinez",
              role: "Verified Buyer",
              company: "Regular Customer",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=7",
            },
          ],
          layout: "grid" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "cta",
        visible: true,
        config: {
          title: "Start Shopping Today!",
          description: "Get 20% off your first order. Use code: WELCOME20 at checkout.",
          primaryCTA: {
            text: "Browse Products",
            link: "#products",
            style: "primary" as const,
          },
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "footer",
        visible: true,
        config: {
          logo: {
            text: "ShopStyle",
            image: "",
          },
          description: "Your trusted online shopping destination.",
          links: [
            {
              title: "Shop",
              items: [
                { text: "New Arrivals", link: "#new" },
                { text: "Best Sellers", link: "#bestsellers" },
                { text: "Sale", link: "#sale" },
                { text: "Categories", link: "#categories" },
              ],
            },
            {
              title: "Customer Service",
              items: [
                { text: "Contact Us", link: "#contact" },
                { text: "Shipping Info", link: "#shipping" },
                { text: "Returns", link: "#returns" },
                { text: "Track Order", link: "#track" },
              ],
            },
            {
              title: "Company",
              items: [
                { text: "About Us", link: "#about" },
                { text: "Careers", link: "#careers" },
                { text: "Blog", link: "#blog" },
                { text: "Press", link: "#press" },
              ],
            },
          ],
          social: [
            { platform: "facebook", link: "#", icon: "facebook" },
            { platform: "instagram", link: "#", icon: "instagram" },
            { platform: "twitter", link: "#", icon: "twitter" },
          ],
          copyright: "© 2024 ShopStyle. All rights reserved.",
        },
      },
    ],
  },
  {
    id: "minimal-portfolio",
    name: "Minimal Portfolio",
    description: "Clean and elegant portfolio for creatives",
    category: "portfolio",
    components: [
      {
        type: "hero",
        visible: true,
        config: {
          title: "Designer & Developer",
          subtitle: "Creating Digital Experiences",
          description:
            "Hi, I'm a creative professional passionate about design and code. Let's build something amazing together.",
          primaryCTA: {
            text: "View My Work",
            link: "#portfolio",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Get In Touch",
            link: "#contact",
            style: "outline" as const,
          },
          alignment: "center" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 1000,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "features",
        visible: true,
        config: {
          title: "What I Do",
          subtitle: "My expertise",
          description: "Specialized in creating beautiful and functional solutions",
          features: [
            {
              title: "UI/UX Design",
              description: "Creating intuitive and beautiful user interfaces",
              icon: "🎨",
              image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
            },
            {
              title: "Web Development",
              description: "Building responsive and performant websites",
              icon: "💻",
              image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
            },
            {
              title: "Mobile Apps",
              description: "Developing native and cross-platform mobile apps",
              icon: "📱",
              image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400",
            },
            {
              title: "Branding",
              description: "Creating memorable brand identities",
              icon: "✨",
              image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400",
            },
          ],
          layout: "grid" as const,
          columns: 2,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 100,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "testimonials",
        visible: true,
        config: {
          title: "Client Testimonials",
          subtitle: "What clients say about working with me",
          description: "Building lasting relationships through quality work",
          testimonials: [
            {
              id: "1",
              content:
                "Exceptional work! The attention to detail and creativity exceeded our expectations.",
              author: "Rachel Green",
              role: "Marketing Manager",
              company: "TechVision",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=8",
            },
            {
              id: "2",
              content:
                "Professional, reliable, and talented. A pleasure to work with from start to finish.",
              author: "Tom Anderson",
              role: "Founder",
              company: "StartupHub",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=9",
            },
          ],
          layout: "grid" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "cta",
        visible: true,
        config: {
          title: "Let's Work Together",
          description:
            "Have a project in mind? Let's discuss how I can help bring your ideas to life.",
          primaryCTA: {
            text: "Start a Project",
            link: "#contact",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Download Resume",
            link: "#resume",
            style: "outline" as const,
          },
          background: {
            type: "solid" as const,
            color: "#000000",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "footer",
        visible: true,
        config: {
          logo: {
            text: "John Doe",
            image: "",
          },
          description: "Designer & Developer based in San Francisco",
          links: [
            {
              title: "Work",
              items: [
                { text: "Portfolio", link: "#portfolio" },
                { text: "Case Studies", link: "#cases" },
                { text: "Services", link: "#services" },
              ],
            },
            {
              title: "Connect",
              items: [
                { text: "Contact", link: "#contact" },
                { text: "LinkedIn", link: "#linkedin" },
                { text: "Resume", link: "#resume" },
              ],
            },
            {
              title: "More",
              items: [
                { text: "About", link: "#about" },
                { text: "Blog", link: "#blog" },
                { text: "Speaking", link: "#speaking" },
              ],
            },
          ],
          social: [
            { platform: "linkedin", link: "#", icon: "linkedin" },
            { platform: "github", link: "#", icon: "github" },
            { platform: "twitter", link: "#", icon: "twitter" },
          ],
          copyright: "© 2024 John Doe. All rights reserved.",
        },
      },
    ],
  },
  {
    id: "ai-startup",
    name: "AI Startup Pro",
    description: "Cutting-edge landing page for AI and Machine Learning companies",
    category: "saas",
    components: [
      {
        type: "hero",
        visible: true,
        config: {
          title: "AI-Powered Solutions for Tomorrow",
          subtitle: "Intelligence • Automation • Innovation",
          description:
            "Harness the power of artificial intelligence to transform your business. Our cutting-edge ML models deliver results that matter.",
          primaryCTA: {
            text: "Start Free Trial",
            link: "#signup",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Watch Demo",
            link: "#demo",
            style: "secondary" as const,
          },
          image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
          alignment: "center" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 1000,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "features",
        visible: true,
        config: {
          title: "Powerful AI Capabilities",
          subtitle: "Everything you need to succeed",
          description: "Enterprise-grade AI tools for modern businesses",
          features: [
            {
              title: "Natural Language Processing",
              description:
                "Advanced NLP for text analysis, sentiment detection, and language understanding",
              icon: "🧠",
              image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&q=80",
            },
            {
              title: "Computer Vision",
              description: "State-of-the-art image recognition and object detection models",
              icon: "👁️",
              image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=400&q=80",
            },
            {
              title: "Predictive Analytics",
              description: "Machine learning models that predict trends and outcomes with accuracy",
              icon: "📊",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
            },
            {
              title: "AutoML Platform",
              description: "Build and deploy ML models without coding expertise required",
              icon: "⚡",
              image: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=400&q=80",
            },
          ],
          layout: "grid" as const,
          columns: 2,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 100,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "pricing",
        visible: true,
        config: {
          title: "Flexible Pricing Plans",
          subtitle: "Choose the plan that fits your needs",
          description: "14-day free trial • No credit card required",
          plans: [
            {
              id: "1",
              name: "Starter",
              price: "$99",
              period: "/month",
              description: "Perfect for small teams",
              features: [
                "100,000 API calls/month",
                "Basic NLP & Vision APIs",
                "Community support",
                "Standard models",
                "Email support",
              ],
              cta: {
                text: "Start Free Trial",
                link: "#signup",
              },
              highlighted: false,
            },
            {
              id: "2",
              name: "Professional",
              price: "$299",
              period: "/month",
              description: "For growing businesses",
              features: [
                "1M API calls/month",
                "All AI models",
                "Priority support",
                "Custom training",
                "Advanced analytics",
                "API documentation",
                "Slack integration",
              ],
              cta: {
                text: "Get Started",
                link: "#signup",
              },
              highlighted: true,
              badge: "Most Popular",
            },
            {
              id: "3",
              name: "Enterprise",
              price: "Custom",
              period: "",
              description: "For large organizations",
              features: [
                "Unlimited API calls",
                "Custom AI models",
                "24/7 phone support",
                "Dedicated account manager",
                "On-premise deployment",
                "SLA guarantee",
                "Training & consulting",
                "White-label solution",
              ],
              cta: {
                text: "Contact Sales",
                link: "#contact",
              },
              highlighted: false,
            },
          ],
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "testimonials",
        visible: true,
        config: {
          title: "Trusted by Industry Leaders",
          subtitle: "What our customers say",
          description: "Join 500+ companies using our AI platform",
          testimonials: [
            {
              id: "1",
              content:
                "This AI platform has revolutionized our data analysis. We've reduced processing time by 80% and improved accuracy significantly.",
              author: "Sarah Chen",
              role: "Chief Data Officer",
              company: "TechCorp Global",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=1",
            },
            {
              id: "2",
              content:
                "The NLP capabilities are outstanding. We've automated our customer support and increased satisfaction by 40%.",
              author: "Michael Roberts",
              role: "VP of Engineering",
              company: "CloudServices Inc",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=2",
            },
            {
              id: "3",
              content:
                "Best-in-class computer vision API. Easy integration and incredibly accurate results. Highly recommended!",
              author: "Emma Watson",
              role: "CTO",
              company: "VisionTech",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=3",
            },
          ],
          layout: "grid" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "cta",
        visible: true,
        config: {
          title: "Ready to Transform Your Business with AI?",
          description:
            "Start your free trial today. No credit card required. Get started in minutes.",
          primaryCTA: {
            text: "Start Free Trial",
            link: "#signup",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Schedule Demo",
            link: "#demo",
            style: "outline" as const,
          },
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "footer",
        visible: true,
        config: {
          logo: {
            text: "AI Platform",
            image: "",
          },
          description: "Empowering businesses with artificial intelligence.",
          links: [
            {
              title: "Product",
              items: [
                { text: "Features", link: "#features" },
                { text: "Pricing", link: "#pricing" },
                { text: "API Docs", link: "#docs" },
                { text: "Changelog", link: "#changelog" },
              ],
            },
            {
              title: "Company",
              items: [
                { text: "About", link: "#about" },
                { text: "Careers", link: "#careers" },
                { text: "Blog", link: "#blog" },
                { text: "Press Kit", link: "#press" },
              ],
            },
            {
              title: "Resources",
              items: [
                { text: "Documentation", link: "#docs" },
                { text: "Tutorials", link: "#tutorials" },
                { text: "Support", link: "#support" },
                { text: "Community", link: "#community" },
              ],
            },
          ],
          social: [
            { platform: "twitter", link: "#", icon: "twitter" },
            { platform: "github", link: "#", icon: "github" },
            { platform: "linkedin", link: "#", icon: "linkedin" },
          ],
          copyright: "© 2024 AI Platform. All rights reserved.",
        },
      },
    ],
  },
  {
    id: "restaurant-elegant",
    name: "Restaurant Elegante",
    description: "Beautiful landing page for restaurants, cafes, and food businesses",
    category: "business",
    components: [
      {
        type: "hero",
        visible: true,
        config: {
          title: "Experience Culinary Excellence",
          subtitle: "Fine Dining • Fresh Ingredients • Unforgettable Taste",
          description:
            "Welcome to our restaurant where passion meets flavor. Join us for an unforgettable dining experience.",
          primaryCTA: {
            text: "Reserve a Table",
            link: "#reservation",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "View Menu",
            link: "#menu",
            style: "outline" as const,
          },
          image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
          alignment: "center" as const,
          background: {
            type: "solid" as const,
            color: "#1a1a1a",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 1000,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "features",
        visible: true,
        config: {
          title: "What Makes Us Special",
          subtitle: "Our commitment to excellence",
          description: "Experience the difference in every dish",
          features: [
            {
              title: "Fresh Local Ingredients",
              description: "We source the finest ingredients from local farms daily",
              icon: "🌿",
              image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=80",
            },
            {
              title: "Award-Winning Chef",
              description: "Michelin-trained chef with 20+ years experience",
              icon: "👨‍🍳",
              image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80",
            },
            {
              title: "Elegant Atmosphere",
              description: "Beautiful ambiance perfect for any special occasion",
              icon: "✨",
              image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
            },
            {
              title: "Private Events",
              description: "Host your special events in our private dining room",
              icon: "🎉",
              image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80",
            },
          ],
          layout: "grid" as const,
          columns: 2,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 100,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "testimonials",
        visible: true,
        config: {
          title: "What Our Guests Say",
          subtitle: "Reviews from our valued customers",
          description: "Rated 4.9/5 on Google Reviews",
          testimonials: [
            {
              id: "1",
              content:
                "Absolutely stunning! The food was exceptional and the service was impeccable. Best dining experience in the city.",
              author: "Jennifer Williams",
              role: "Food Critic",
              company: "City Magazine",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=5",
            },
            {
              id: "2",
              content:
                "Perfect for our anniversary dinner. The ambiance, food, and service exceeded all expectations. Will definitely return!",
              author: "David & Maria Lopez",
              role: "Anniversary Celebration",
              company: "",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=6",
            },
            {
              id: "3",
              content:
                "Every dish was a masterpiece. The chef's attention to detail and flavor combinations are truly outstanding.",
              author: "Robert Chen",
              role: "Regular Guest",
              company: "",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=7",
            },
          ],
          layout: "grid" as const,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "cta",
        visible: true,
        config: {
          title: "Reserve Your Table Today",
          description: "Don't miss out on an extraordinary dining experience. Book your table now!",
          primaryCTA: {
            text: "Make a Reservation",
            link: "#reservation",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Call Us: (555) 123-4567",
            link: "tel:+15551234567",
            style: "outline" as const,
          },
          background: {
            type: "solid" as const,
            color: "#1a1a1a",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "footer",
        visible: true,
        config: {
          logo: {
            text: "Elegante",
            image: "",
          },
          description: "Fine dining at its best since 2005",
          links: [
            {
              title: "Visit Us",
              items: [
                { text: "Reservation", link: "#reservation" },
                { text: "Menu", link: "#menu" },
                { text: "Events", link: "#events" },
                { text: "Gift Cards", link: "#gifts" },
              ],
            },
            {
              title: "About",
              items: [
                { text: "Our Story", link: "#story" },
                { text: "Chef", link: "#chef" },
                { text: "Careers", link: "#careers" },
                { text: "Press", link: "#press" },
              ],
            },
            {
              title: "Contact",
              items: [
                { text: "Location", link: "#location" },
                { text: "Hours", link: "#hours" },
                { text: "Contact Us", link: "#contact" },
                { text: "Private Events", link: "#private" },
              ],
            },
          ],
          social: [
            { platform: "facebook", link: "#", icon: "facebook" },
            { platform: "instagram", link: "#", icon: "instagram" },
            { platform: "twitter", link: "#", icon: "twitter" },
          ],
          copyright: "© 2024 Restaurant Elegante. All rights reserved.",
        },
      },
    ],
  },
  {
    id: "fitness-gym",
    name: "FitLife Gym",
    description: "Energetic landing page for gyms, fitness centers, and personal trainers",
    category: "business",
    components: [
      {
        type: "hero",
        visible: true,
        config: {
          title: "Transform Your Body, Transform Your Life",
          subtitle: "Strength • Endurance • Results",
          description:
            "Join FitLife and achieve your fitness goals with expert trainers, modern equipment, and a supportive community.",
          primaryCTA: {
            text: "Start Free Trial",
            link: "#trial",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "View Classes",
            link: "#classes",
            style: "secondary" as const,
          },
          image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
          alignment: "left" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 800,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "features",
        visible: true,
        config: {
          title: "Why Choose FitLife?",
          subtitle: "Everything you need to succeed",
          description: "State-of-the-art facilities and expert guidance",
          features: [
            {
              title: "Expert Personal Trainers",
              description: "Certified trainers with years of experience to guide your journey",
              icon: "💪",
            },
            {
              title: "Modern Equipment",
              description: "Latest fitness equipment and technology for optimal results",
              icon: "🏋️",
            },
            {
              title: "Group Classes",
              description: "Yoga, HIIT, Spin, Pilates and more - over 50 classes weekly",
              icon: "🧘",
            },
            {
              title: "Nutrition Coaching",
              description: "Personalized meal plans and nutrition guidance included",
              icon: "🥗",
            },
            {
              title: "24/7 Access",
              description: "Work out on your schedule with round-the-clock access",
              icon: "🕐",
            },
            {
              title: "Community Support",
              description: "Join a motivating community that celebrates your success",
              icon: "🤝",
            },
          ],
          layout: "grid" as const,
          columns: 3,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 100,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "pricing",
        visible: true,
        config: {
          title: "Flexible Membership Plans",
          subtitle: "Choose what works for you",
          description: "All plans include access to facilities and group classes",
          plans: [
            {
              id: "1",
              name: "Basic",
              price: "$29",
              period: "/month",
              description: "Perfect for getting started",
              features: [
                "Gym access (6am-10pm)",
                "Cardio & weight equipment",
                "Locker room & showers",
                "Mobile app access",
              ],
              cta: {
                text: "Start Trial",
                link: "#signup",
              },
              highlighted: false,
            },
            {
              id: "2",
              name: "Premium",
              price: "$59",
              period: "/month",
              description: "Most popular choice",
              features: [
                "24/7 gym access",
                "All equipment access",
                "Unlimited group classes",
                "1 personal training session/month",
                "Nutrition consultation",
                "Guest passes (2/month)",
              ],
              cta: {
                text: "Get Started",
                link: "#signup",
              },
              highlighted: true,
              badge: "Best Value",
            },
            {
              id: "3",
              name: "Elite",
              price: "$99",
              period: "/month",
              description: "For serious athletes",
              features: [
                "Everything in Premium",
                "4 personal training sessions/month",
                "Sports massage (1/month)",
                "Priority class booking",
                "Private locker",
                "Supplement discounts",
                "Towel service",
              ],
              cta: {
                text: "Join Elite",
                link: "#signup",
              },
              highlighted: false,
            },
          ],
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "testimonials",
        visible: true,
        config: {
          title: "Success Stories",
          subtitle: "Real results from real people",
          description: "See how FitLife changed their lives",
          testimonials: [
            {
              id: "1",
              content:
                "Lost 30 pounds in 6 months! The trainers are amazing and the community keeps me motivated every day.",
              author: "Jessica Martinez",
              role: "Member since 2023",
              company: "Lost 30 lbs",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=8",
            },
            {
              id: "2",
              content:
                "Best gym I've ever joined. The facilities are top-notch and the atmosphere is incredibly supportive.",
              author: "Tom Anderson",
              role: "Elite Member",
              company: "Gained 15 lbs muscle",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=9",
            },
            {
              id: "3",
              content:
                "The group classes are fantastic! I've made great friends and achieved fitness goals I never thought possible.",
              author: "Lisa Thompson",
              role: "Premium Member",
              company: "Marathon Runner",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=10",
            },
          ],
          layout: "grid" as const,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "cta",
        visible: true,
        config: {
          title: "Ready to Start Your Fitness Journey?",
          description: "Get 7 days free trial - No credit card required. Experience FitLife today!",
          primaryCTA: {
            text: "Start Free Trial",
            link: "#trial",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Take a Tour",
            link: "#tour",
            style: "outline" as const,
          },
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "footer",
        visible: true,
        config: {
          logo: {
            text: "FitLife Gym",
            image: "",
          },
          description: "Your journey to a healthier lifestyle starts here",
          links: [
            {
              title: "Membership",
              items: [
                { text: "Plans & Pricing", link: "#pricing" },
                { text: "Free Trial", link: "#trial" },
                { text: "Personal Training", link: "#training" },
                { text: "Group Classes", link: "#classes" },
              ],
            },
            {
              title: "Facilities",
              items: [
                { text: "Equipment", link: "#equipment" },
                { text: "Schedule", link: "#schedule" },
                { text: "Locations", link: "#locations" },
                { text: "Virtual Tour", link: "#tour" },
              ],
            },
            {
              title: "Support",
              items: [
                { text: "FAQs", link: "#faq" },
                { text: "Contact", link: "#contact" },
                { text: "Member Portal", link: "#portal" },
                { text: "Careers", link: "#careers" },
              ],
            },
          ],
          social: [
            { platform: "facebook", link: "#", icon: "facebook" },
            { platform: "instagram", link: "#", icon: "instagram" },
            { platform: "twitter", link: "#", icon: "twitter" },
          ],
          copyright: "© 2024 FitLife Gym. All rights reserved.",
        },
      },
    ],
  },
  {
    id: "real-estate-luxury",
    name: "Luxury Real Estate",
    description: "Premium landing page for real estate agencies and property listings",
    category: "business",
    components: [
      {
        type: "hero",
        visible: true,
        config: {
          title: "Find Your Dream Home Today",
          subtitle: "Luxury Properties • Prime Locations • Expert Service",
          description:
            "Discover exclusive properties in the most desirable neighborhoods. Let our expert agents help you find your perfect home.",
          primaryCTA: {
            text: "Browse Properties",
            link: "#properties",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Contact Agent",
            link: "#contact",
            style: "outline" as const,
          },
          image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
          alignment: "center" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 1000,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "features",
        visible: true,
        config: {
          title: "Why Choose Us",
          subtitle: "Your trusted real estate partner",
          description: "Experience excellence in real estate",
          features: [
            {
              title: "Exclusive Listings",
              description: "Access to premium properties not available elsewhere",
              icon: "🏡",
              image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80",
            },
            {
              title: "Expert Agents",
              description: "Experienced agents with local market expertise",
              icon: "👔",
              image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80",
            },
            {
              title: "Virtual Tours",
              description: "3D virtual tours of properties from anywhere",
              icon: "🎥",
              image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400&q=80",
            },
            {
              title: "Market Insights",
              description: "Real-time market data and investment analysis",
              icon: "📈",
              image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
            },
          ],
          layout: "grid" as const,
          columns: 2,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 100,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "testimonials",
        visible: true,
        config: {
          title: "Client Success Stories",
          subtitle: "What our clients say",
          description: "Trusted by thousands of happy homeowners",
          testimonials: [
            {
              id: "1",
              content:
                "Found our dream home in just 2 weeks! The agent was professional, knowledgeable, and made the process seamless.",
              author: "Amanda & John Miller",
              role: "Homeowners",
              company: "Beverly Hills",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=11",
            },
            {
              id: "2",
              content:
                "Sold our property for 15% above asking price. Outstanding service and marketing strategy!",
              author: "Robert Davidson",
              role: "Property Seller",
              company: "Manhattan",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=12",
            },
            {
              id: "3",
              content:
                "Best real estate experience ever. The team went above and beyond to find exactly what we wanted.",
              author: "Sofia Rodriguez",
              role: "First-time Buyer",
              company: "Miami",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=13",
            },
          ],
          layout: "grid" as const,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "cta",
        visible: true,
        config: {
          title: "Ready to Find Your Perfect Property?",
          description: "Schedule a free consultation with one of our expert agents today.",
          primaryCTA: {
            text: "Schedule Consultation",
            link: "#consultation",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "View All Listings",
            link: "#listings",
            style: "outline" as const,
          },
          background: {
            type: "solid" as const,
            color: "#1e3a8a",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "footer",
        visible: true,
        config: {
          logo: {
            text: "Elite Properties",
            image: "",
          },
          description: "Your gateway to luxury living since 1995",
          links: [
            {
              title: "Properties",
              items: [
                { text: "Buy", link: "#buy" },
                { text: "Sell", link: "#sell" },
                { text: "Rent", link: "#rent" },
                { text: "New Listings", link: "#new" },
              ],
            },
            {
              title: "Services",
              items: [
                { text: "Property Management", link: "#management" },
                { text: "Home Valuation", link: "#valuation" },
                { text: "Investment Analysis", link: "#investment" },
                { text: "Relocation", link: "#relocation" },
              ],
            },
            {
              title: "Company",
              items: [
                { text: "About Us", link: "#about" },
                { text: "Our Agents", link: "#agents" },
                { text: "Testimonials", link: "#testimonials" },
                { text: "Contact", link: "#contact" },
              ],
            },
          ],
          social: [
            { platform: "facebook", link: "#", icon: "facebook" },
            { platform: "instagram", link: "#", icon: "instagram" },
            { platform: "linkedin", link: "#", icon: "linkedin" },
          ],
          copyright: "© 2024 Elite Properties. All rights reserved.",
        },
      },
    ],
  },
  {
    id: "mobile-app-launch",
    name: "App Launch Pro",
    description: "Modern landing page for mobile app launches and downloads",
    category: "saas",
    components: [
      {
        type: "hero",
        visible: true,
        config: {
          title: "Your Life, Simplified",
          subtitle: "One App • Endless Possibilities",
          description:
            "Download the app that millions trust. Available now on iOS and Android. Get started in seconds!",
          primaryCTA: {
            text: "Download on App Store",
            link: "#appstore",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Get it on Google Play",
            link: "#playstore",
            style: "secondary" as const,
          },
          image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
          alignment: "center" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 800,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "features",
        visible: true,
        config: {
          title: "Powerful Features",
          subtitle: "Everything you need in one app",
          description: "Designed for simplicity, built for power",
          features: [
            {
              title: "Lightning Fast",
              description: "Optimized performance for instant loading and smooth experience",
              icon: "⚡",
            },
            {
              title: "Secure & Private",
              description: "Bank-level encryption to keep your data safe and secure",
              icon: "🔒",
            },
            {
              title: "Offline Mode",
              description: "Access your content anywhere, even without internet",
              icon: "📴",
            },
            {
              title: "Smart Sync",
              description: "Seamlessly sync across all your devices in real-time",
              icon: "🔄",
            },
            {
              title: "Beautiful Design",
              description: "Intuitive interface that's a joy to use every day",
              icon: "🎨",
            },
            {
              title: "Always Updated",
              description: "Regular updates with new features and improvements",
              icon: "🚀",
            },
          ],
          layout: "grid" as const,
          columns: 3,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 100,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "pricing",
        visible: true,
        config: {
          title: "Choose Your Plan",
          subtitle: "Start free, upgrade anytime",
          description: "7-day free trial • No credit card required",
          plans: [
            {
              id: "1",
              name: "Free",
              price: "$0",
              period: "/forever",
              description: "Perfect for trying out",
              features: ["Basic features", "Up to 5 projects", "1GB storage", "Community support"],
              cta: {
                text: "Download Free",
                link: "#download",
              },
              highlighted: false,
            },
            {
              id: "2",
              name: "Pro",
              price: "$9.99",
              period: "/month",
              description: "For power users",
              features: [
                "All features unlocked",
                "Unlimited projects",
                "50GB storage",
                "Priority support",
                "Advanced analytics",
                "Export capabilities",
              ],
              cta: {
                text: "Start Free Trial",
                link: "#trial",
              },
              highlighted: true,
              badge: "Popular",
            },
            {
              id: "3",
              name: "Teams",
              price: "$29.99",
              period: "/month",
              description: "For teams & businesses",
              features: [
                "Everything in Pro",
                "Up to 10 team members",
                "500GB storage",
                "Admin controls",
                "Team collaboration",
                "API access",
                "Custom branding",
              ],
              cta: {
                text: "Contact Sales",
                link: "#sales",
              },
              highlighted: false,
            },
          ],
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "testimonials",
        visible: true,
        config: {
          title: "Loved by Millions",
          subtitle: "What users are saying",
          description: "4.8/5 rating on App Store & Google Play",
          testimonials: [
            {
              id: "1",
              content:
                "This app has completely changed how I organize my life. Can't imagine my day without it!",
              author: "Emily Watson",
              role: "Verified User",
              company: "5M+ Downloads",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=14",
            },
            {
              id: "2",
              content:
                "Simple, beautiful, and incredibly powerful. Best app I've downloaded this year!",
              author: "Marcus Johnson",
              role: "Pro User",
              company: "App Store Review",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=15",
            },
            {
              id: "3",
              content:
                "The team collaboration features are game-changing. Our productivity has increased by 40%!",
              author: "Lisa Chang",
              role: "Team Admin",
              company: "Business User",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=16",
            },
          ],
          layout: "grid" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "cta",
        visible: true,
        config: {
          title: "Download Now and Get Started!",
          description: "Join 5 million+ users worldwide. Free to download, instant to set up.",
          primaryCTA: {
            text: "Download App",
            link: "#download",
            style: "primary" as const,
          },
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "footer",
        visible: true,
        config: {
          logo: {
            text: "AppName",
            image: "",
          },
          description: "Simplifying life, one tap at a time.",
          links: [
            {
              title: "Product",
              items: [
                { text: "Features", link: "#features" },
                { text: "Pricing", link: "#pricing" },
                { text: "Download", link: "#download" },
                { text: "Updates", link: "#updates" },
              ],
            },
            {
              title: "Resources",
              items: [
                { text: "Help Center", link: "#help" },
                { text: "Tutorials", link: "#tutorials" },
                { text: "Blog", link: "#blog" },
                { text: "Status", link: "#status" },
              ],
            },
            {
              title: "Company",
              items: [
                { text: "About", link: "#about" },
                { text: "Careers", link: "#careers" },
                { text: "Press", link: "#press" },
                { text: "Contact", link: "#contact" },
              ],
            },
          ],
          social: [
            { platform: "twitter", link: "#", icon: "twitter" },
            { platform: "facebook", link: "#", icon: "facebook" },
            { platform: "instagram", link: "#", icon: "instagram" },
          ],
          copyright: "© 2024 AppName. All rights reserved.",
        },
      },
    ],
  },

  // ==================== PREMIUM SAAS TEMPLATE ====================
  {
    id: "premium-saas",
    name: "Premium SaaS Platform",
    description: "Complete SaaS template with all essential sections",
    category: "saas",
    components: [
      {
        type: "hero",
        visible: true,
        config: {
          title: "Transform Your Workflow with AI-Powered Automation",
          subtitle: "The Complete Solution for Modern Teams",
          description:
            "Streamline operations, boost productivity by 10x, and scale your business with our intelligent automation platform. Trusted by 50,000+ teams worldwide.",
          primaryCTA: {
            text: "Start Free 14-Day Trial",
            link: "#signup",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Watch 2-Min Demo",
            link: "#demo",
            style: "secondary" as const,
          },
          image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200",
          alignment: "center" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 800,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "logo-cloud",
        visible: true,
        config: {
          title: "Trusted by Industry Leaders Worldwide",
          subtitle: "Join 50,000+ companies using our platform",
          logos: [
            {
              name: "Google",
              url: "https://via.placeholder.com/150x50/4285F4/FFF?text=Google",
              link: "#",
            },
            {
              name: "Microsoft",
              url: "https://via.placeholder.com/150x50/00A4EF/FFF?text=Microsoft",
              link: "#",
            },
            {
              name: "Amazon",
              url: "https://via.placeholder.com/150x50/FF9900/FFF?text=Amazon",
              link: "#",
            },
            {
              name: "Apple",
              url: "https://via.placeholder.com/150x50/000000/FFF?text=Apple",
              link: "#",
            },
            {
              name: "Meta",
              url: "https://via.placeholder.com/150x50/0668E1/FFF?text=Meta",
              link: "#",
            },
            {
              name: "Netflix",
              url: "https://via.placeholder.com/150x50/E50914/FFF?text=Netflix",
              link: "#",
            },
          ],
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          spacing: {
            padding: "lg" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "features",
        visible: true,
        config: {
          title: "Everything You Need to Succeed",
          subtitle: "Powerful Features Built for Teams",
          description:
            "Our platform combines cutting-edge technology with intuitive design to help you achieve more in less time.",
          features: [
            {
              id: "1",
              icon: "🤖",
              title: "AI-Powered Automation",
              description:
                "Automate repetitive tasks with intelligent workflows that learn from your behavior and adapt to your needs.",
              image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
            },
            {
              id: "2",
              icon: "📊",
              title: "Advanced Analytics",
              description:
                "Get real-time insights with customizable dashboards, detailed reports, and predictive analytics.",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
            },
            {
              id: "3",
              icon: "🔐",
              title: "Enterprise Security",
              description:
                "Bank-level encryption, SOC 2 certified, GDPR compliant with advanced access controls and audit logs.",
              image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400",
            },
            {
              id: "4",
              icon: "🚀",
              title: "Blazing Fast Performance",
              description:
                "Lightning-fast load times and real-time syncing across all devices with 99.99% uptime SLA.",
              image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
            },
            {
              id: "5",
              icon: "🌐",
              title: "Global CDN",
              description:
                "Deliver content at lightning speed with our global CDN network spanning 180+ locations worldwide.",
              image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
            },
            {
              id: "6",
              icon: "🔗",
              title: "Seamless Integrations",
              description:
                "Connect with 1000+ apps including Slack, Salesforce, HubSpot, and all your favorite tools.",
              image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400",
            },
          ],
          layout: "grid" as const,
          columns: 3,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 100,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "stats",
        visible: true,
        config: {
          title: "Trusted by Businesses Worldwide",
          subtitle: "PROVEN RESULTS",
          description: "Our platform delivers measurable impact for companies of all sizes",
          stats: [
            {
              id: "1",
              value: "50K",
              label: "Active Companies",
              suffix: "+",
              prefix: "",
            },
            {
              id: "2",
              value: "99.99",
              label: "Uptime Guarantee",
              suffix: "%",
              prefix: "",
            },
            {
              id: "3",
              value: "10x",
              label: "Productivity Boost",
              suffix: "",
              prefix: "",
            },
            {
              id: "4",
              value: "24/7",
              label: "Customer Support",
              suffix: "",
              prefix: "",
            },
          ],
          layout: "grid" as const,
          columns: 4,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "content",
        visible: true,
        config: {
          title: "Built for Teams of All Sizes",
          subtitle: "FROM STARTUPS TO ENTERPRISES",
          content:
            "Whether you're a small team or a large enterprise, our platform scales with your needs. Start with essential features and unlock advanced capabilities as you grow. Our flexible architecture ensures you never outgrow the platform.",
          image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
          imagePosition: "right" as const,
          features: [
            "Unlimited team members",
            "Role-based permissions",
            "Custom workflows",
            "API access",
            "White-label options",
          ],
          cta: {
            text: "Explore Enterprise Features",
            link: "#enterprise",
          },
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "pricing",
        visible: true,
        config: {
          title: "Choose Your Perfect Plan",
          subtitle: "Flexible pricing that grows with you",
          description:
            "Start free, upgrade when you're ready. All plans include 14-day free trial.",
          plans: [
            {
              id: "1",
              name: "Starter",
              price: "$0",
              period: "per month",
              description: "Perfect for individuals and small teams",
              features: [
                "Up to 5 team members",
                "10 GB storage",
                "Basic automation",
                "Email support",
                "Mobile apps",
                "100 API calls/day",
              ],
              cta: {
                text: "Start Free",
                link: "#signup",
              },
              highlighted: false,
            },
            {
              id: "2",
              name: "Professional",
              price: "$49",
              period: "per user/month",
              description: "For growing teams that need more power",
              features: [
                "Up to 50 team members",
                "100 GB storage",
                "Advanced automation",
                "Priority email & chat support",
                "All integrations",
                "Unlimited API calls",
                "Custom branding",
                "Advanced analytics",
              ],
              cta: {
                text: "Start Free Trial",
                link: "#signup",
              },
              highlighted: true,
              badge: "Most Popular",
            },
            {
              id: "3",
              name: "Enterprise",
              price: "Custom",
              period: "",
              description: "For organizations with advanced needs",
              features: [
                "Unlimited team members",
                "Unlimited storage",
                "AI-powered workflows",
                "24/7 phone & email support",
                "Dedicated account manager",
                "Custom SLA",
                "On-premise deployment",
                "Advanced security features",
                "Custom development",
              ],
              cta: {
                text: "Contact Sales",
                link: "#contact",
              },
              highlighted: false,
            },
          ],
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "testimonials",
        visible: true,
        config: {
          title: "Loved by Teams Worldwide",
          subtitle: "CUSTOMER SUCCESS STORIES",
          description: "See what our customers have to say about their experience",
          testimonials: [
            {
              id: "1",
              content:
                "This platform has completely transformed how our team works. We've seen a 300% increase in productivity and our clients are happier than ever. The automation features alone have saved us countless hours.",
              author: "Sarah Chen",
              role: "VP of Operations",
              company: "TechFlow Inc.",
              rating: 5,
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            },
            {
              id: "2",
              content:
                "We tried 5 different platforms before finding this one. The difference is night and day. The support team is incredible and the feature set is unmatched. Worth every penny!",
              author: "Michael Rodriguez",
              role: "CEO",
              company: "GrowthLabs",
              rating: 5,
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            },
            {
              id: "3",
              content:
                "The ROI we've seen is incredible. We implemented this 6 months ago and have already reduced operational costs by 40% while improving output quality. Highly recommend to any serious business.",
              author: "Emily Watson",
              role: "COO",
              company: "InnovateCo",
              rating: 5,
              avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
            },
            {
              id: "4",
              content:
                "Best investment we've made this year. The platform is intuitive, powerful, and the integrations work flawlessly. Our team was up and running in less than a day.",
              author: "David Park",
              role: "CTO",
              company: "StartupXYZ",
              rating: 5,
              avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
            },
            {
              id: "5",
              content:
                "We've been using this for 2 years now and it just keeps getting better. The continuous updates and new features show that the team really cares about their customers.",
              author: "Lisa Thompson",
              role: "Director of Marketing",
              company: "ScaleCorp",
              rating: 5,
              avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150",
            },
            {
              id: "6",
              content:
                "Game-changing platform! The analytics alone are worth the price. We now have visibility into every aspect of our operations and can make data-driven decisions instantly.",
              author: "James Miller",
              role: "Head of Analytics",
              company: "DataFirst",
              rating: 5,
              avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150",
            },
          ],
          layout: "grid" as const,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "faq",
        visible: true,
        config: {
          title: "Frequently Asked Questions",
          subtitle: "EVERYTHING YOU NEED TO KNOW",
          description: "Can't find your answer? Contact our support team anytime.",
          faqs: [
            {
              id: "1",
              question: "How does the 14-day free trial work?",
              answer:
                "Start using our platform immediately with full access to all Professional features. No credit card required. After 14 days, choose a plan or downgrade to our free Starter plan. Your data is always safe and exportable.",
            },
            {
              id: "2",
              question: "Can I change plans at any time?",
              answer:
                "Absolutely! Upgrade, downgrade, or cancel anytime. Changes are prorated and reflected in your next billing cycle. There are no cancellation fees or long-term contracts.",
            },
            {
              id: "3",
              question: "What payment methods do you accept?",
              answer:
                "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and for Enterprise customers, we also accept wire transfers and purchase orders.",
            },
            {
              id: "4",
              question: "Is my data secure?",
              answer:
                "Yes! We use bank-level 256-bit encryption, are SOC 2 Type II certified, GDPR compliant, and perform regular security audits. Your data is backed up daily and stored in secure, redundant data centers.",
            },
            {
              id: "5",
              question: "Do you offer discounts for non-profits or educational institutions?",
              answer:
                "Yes! We offer 50% discount for registered non-profit organizations and educational institutions. Contact our sales team with your documentation to qualify.",
            },
            {
              id: "6",
              question: "What kind of support do you provide?",
              answer:
                "Starter plan includes email support (48h response time). Professional plan includes priority email and chat support (4h response time). Enterprise plan includes 24/7 phone and email support with a dedicated account manager.",
            },
            {
              id: "7",
              question: "Can I import data from other platforms?",
              answer:
                "Yes! We offer free data migration assistance and provide import tools for all major platforms. Our team can help you migrate your existing data with zero downtime.",
            },
            {
              id: "8",
              question: "Do you offer API access?",
              answer:
                "Yes! All paid plans include API access. Starter plan has a limit of 100 calls/day, Professional plan has unlimited API calls, and Enterprise plan includes custom API endpoints and webhooks.",
            },
          ],
          columns: 2,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "cta",
        visible: true,
        config: {
          title: "Ready to Transform Your Workflow?",
          description:
            "Join 50,000+ teams already using our platform. Start your free 14-day trial today - no credit card required!",
          primaryCTA: {
            text: "Start Free Trial Now",
            link: "#signup",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "Schedule a Demo",
            link: "#demo",
            style: "outline" as const,
          },
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "footer",
        visible: true,
        config: {
          logo: {
            text: "YourSaaS",
            image: "",
          },
          description: "Empowering teams to work smarter, faster, and better.",
          links: [
            {
              title: "Product",
              items: [
                { text: "Features", link: "#features" },
                { text: "Pricing", link: "#pricing" },
                { text: "Integrations", link: "#integrations" },
                { text: "API Documentation", link: "#api" },
                { text: "Changelog", link: "#changelog" },
                { text: "Roadmap", link: "#roadmap" },
              ],
            },
            {
              title: "Resources",
              items: [
                { text: "Blog", link: "#blog" },
                { text: "Help Center", link: "#help" },
                { text: "Video Tutorials", link: "#tutorials" },
                { text: "Case Studies", link: "#cases" },
                { text: "Webinars", link: "#webinars" },
                { text: "Community", link: "#community" },
              ],
            },
            {
              title: "Company",
              items: [
                { text: "About Us", link: "#about" },
                { text: "Careers", link: "#careers" },
                { text: "Press Kit", link: "#press" },
                { text: "Partners", link: "#partners" },
                { text: "Contact", link: "#contact" },
              ],
            },
            {
              title: "Legal",
              items: [
                { text: "Privacy Policy", link: "#privacy" },
                { text: "Terms of Service", link: "#terms" },
                { text: "Security", link: "#security" },
                { text: "Cookie Policy", link: "#cookies" },
                { text: "GDPR", link: "#gdpr" },
              ],
            },
          ],
          social: [
            { platform: "twitter", link: "https://twitter.com", icon: "twitter" },
            { platform: "linkedin", link: "https://linkedin.com", icon: "linkedin" },
            { platform: "facebook", link: "https://facebook.com", icon: "facebook" },
            { platform: "github", link: "https://github.com", icon: "github" },
            { platform: "youtube", link: "https://youtube.com", icon: "youtube" },
          ],
          copyright: "© 2024 YourSaaS. All rights reserved.",
        },
      },
    ],
  },
  {
    id: "crossfit-box",
    name: "IronBox CrossFit",
    description: "Bold landing page for CrossFit boxes, functional fitness, and strength gyms",
    category: "business",
    components: [
      {
        type: "hero",
        visible: true,
        config: {
          title: "Forge Strength. Build Community.",
          subtitle: "FUNCTIONAL FITNESS • OLYMPIC LIFTING • CONDITIONING",
          description:
            "IronBox is more than a gym — it's a community of athletes pushing each other to be stronger every day. Coached programming, no ego, all effort.",
          primaryCTA: {
            text: "Book a Free WOD",
            link: "#trial",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "See Our Programs",
            link: "#programs",
            style: "outline" as const,
          },
          image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
          alignment: "left" as const,
          background: {
            type: "solid" as const,
            color: "#0a0a0a",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 800,
            delay: 0,
          },
          spacing: {
            padding: "2xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "features",
        visible: true,
        config: {
          title: "Our Programs",
          subtitle: "Everything you need to get stronger",
          description: "Coached programming for every level, from first-timers to competitors",
          features: [
            {
              title: "CrossFit WOD Classes",
              description: "Constantly varied, high-intensity workouts coached in small groups",
              icon: "🔥",
            },
            {
              title: "Olympic Weightlifting",
              description: "Dedicated technique work on the snatch and clean & jerk",
              icon: "🏋️",
            },
            {
              title: "Strength & Conditioning",
              description: "Build a foundation of raw strength with structured progressions",
              icon: "💪",
            },
            {
              title: "Nutrition Coaching",
              description: "Fuel your training with a plan built around your goals",
              icon: "🥗",
            },
            {
              title: "Open Gym Access",
              description: "Extra time on the platform to work on your own goals",
              icon: "🕐",
            },
            {
              title: "Community Competitions",
              description: "In-house throwdowns and team events all year round",
              icon: "🏆",
            },
          ],
          layout: "grid" as const,
          columns: 3,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 100,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "stats",
        visible: true,
        config: {
          title: "The IronBox Community",
          subtitle: "BY THE NUMBERS",
          description: "A decade of building stronger athletes",
          stats: [
            {
              id: "1",
              value: "500",
              label: "Athletes Trained",
              suffix: "+",
              prefix: "",
            },
            {
              id: "2",
              value: "12",
              label: "Certified Coaches",
              suffix: "",
              prefix: "",
            },
            {
              id: "3",
              value: "35",
              label: "Classes Per Week",
              suffix: "+",
              prefix: "",
            },
            {
              id: "4",
              value: "10",
              label: "Years Established",
              suffix: "",
              prefix: "",
            },
          ],
          layout: "grid" as const,
          columns: 4,
          background: {
            type: "solid" as const,
            color: "#0a0a0a",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "pricing",
        visible: true,
        config: {
          title: "Membership Plans",
          subtitle: "Train your way",
          description: "No contracts, no hidden fees — cancel anytime",
          plans: [
            {
              id: "1",
              name: "Drop-In",
              price: "$25",
              period: "/class",
              description: "Visiting or just trying it out",
              features: ["Single class access", "All equipment included", "No commitment"],
              cta: {
                text: "Drop In",
                link: "#signup",
              },
              highlighted: false,
            },
            {
              id: "2",
              name: "Unlimited",
              price: "$149",
              period: "/month",
              description: "Our most popular plan",
              features: [
                "Unlimited classes",
                "Open gym access",
                "1 nutrition check-in/month",
                "Access to all programming",
                "Member community events",
              ],
              cta: {
                text: "Join Now",
                link: "#signup",
              },
              highlighted: true,
              badge: "Most Popular",
            },
            {
              id: "3",
              name: "Founding Athlete",
              price: "$199",
              period: "/month",
              description: "For athletes all-in on their training",
              features: [
                "Everything in Unlimited",
                "2 personal coaching sessions/month",
                "Priority competition entry",
                "Custom programming review",
                "Founding member merch",
              ],
              cta: {
                text: "Go All-In",
                link: "#signup",
              },
              highlighted: false,
            },
          ],
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "testimonials",
        visible: true,
        config: {
          title: "Real Athletes, Real Results",
          subtitle: "What our members say",
          description: "The IronBox community in their own words",
          testimonials: [
            {
              id: "1",
              content:
                "I walked in with zero experience and terrified of barbells. A year later I pulled my first 200lb deadlift. The coaching here is next level.",
              author: "Marcus Reid",
              role: "Member since 2023",
              company: "First 200lb deadlift",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=12",
            },
            {
              id: "2",
              content:
                "Best community I've ever trained with. Everyone pushes each other but nobody judges — that's rare to find in a gym.",
              author: "Priya Nair",
              role: "Unlimited Member",
              company: "3x in-house competitor",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=13",
            },
            {
              id: "3",
              content:
                "The programming is smart and the coaches actually watch your form. I've made more progress in 6 months here than 2 years at a regular gym.",
              author: "Daniel Osei",
              role: "Founding Athlete",
              company: "Competitive lifter",
              rating: 5,
              avatar: "https://i.pravatar.cc/150?img=14",
            },
          ],
          layout: "grid" as const,
          background: {
            type: "solid" as const,
            color: "#f9fafb",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "faq",
        visible: true,
        config: {
          title: "New to CrossFit?",
          subtitle: "GOT QUESTIONS?",
          description: "Everything you need to know before your first class",
          faqs: [
            {
              id: "1",
              question: "Do I need experience to start?",
              answer:
                "Not at all. Every new athlete starts with our onboarding program where a coach walks you through the fundamental movements before you join regular classes. Most of our members had never touched a barbell before joining.",
            },
            {
              id: "2",
              question: "What should I bring to my first class?",
              answer:
                "Comfortable athletic clothing, a water bottle, and a towel. We provide all the equipment — barbells, kettlebells, rings, rowers, and more. Just show up ready to work.",
            },
            {
              id: "3",
              question: "Can I try a class before joining?",
              answer:
                "Yes! Book a free intro WOD using the button at the top of the page. You'll get a full class experience with one of our coaches, no commitment required.",
            },
            {
              id: "4",
              question: "How intense are the workouts really?",
              answer:
                "Every workout is scaled to your fitness level. Our coaches adjust weight, reps, and movements so beginners and competitive athletes can train in the same class safely and effectively.",
            },
            {
              id: "5",
              question: "Is there a contract?",
              answer:
                "No long-term contracts on any plan. Memberships are month-to-month and you can cancel anytime with 30 days' notice.",
            },
          ],
          layout: "accordion" as const,
          columns: 1,
          background: {
            type: "solid" as const,
            color: "#ffffff",
          },
          animation: {
            type: "fadeInUp" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "cta",
        visible: true,
        config: {
          title: "Ready to Join the Box?",
          description: "Book your free intro WOD today — no experience, no equipment required.",
          primaryCTA: {
            text: "Book a Free WOD",
            link: "#trial",
            style: "primary" as const,
          },
          secondaryCTA: {
            text: "View Schedule",
            link: "#schedule",
            style: "outline" as const,
          },
          background: {
            type: "solid" as const,
            color: "#0a0a0a",
          },
          animation: {
            type: "fadeIn" as const,
            duration: 600,
            delay: 0,
          },
          spacing: {
            padding: "xl" as const,
            margin: "none" as const,
          },
        },
      },
      {
        type: "footer",
        visible: true,
        config: {
          logo: {
            text: "IronBox CrossFit",
            image: "",
          },
          description: "Forge strength. Build community.",
          links: [
            {
              title: "Training",
              items: [
                { text: "Programs", link: "#programs" },
                { text: "Schedule", link: "#schedule" },
                { text: "Coaches", link: "#coaches" },
                { text: "Membership", link: "#pricing" },
              ],
            },
            {
              title: "Community",
              items: [
                { text: "Competitions", link: "#competitions" },
                { text: "Success Stories", link: "#testimonials" },
                { text: "Nutrition", link: "#nutrition" },
                { text: "Events", link: "#events" },
              ],
            },
            {
              title: "Support",
              items: [
                { text: "FAQs", link: "#faq" },
                { text: "Contact", link: "#contact" },
                { text: "Free Trial", link: "#trial" },
              ],
            },
          ],
          social: [
            { platform: "instagram", link: "#", icon: "instagram" },
            { platform: "facebook", link: "#", icon: "facebook" },
            { platform: "youtube", link: "#", icon: "youtube" },
          ],
          copyright: "© 2024 IronBox CrossFit. All rights reserved.",
        },
      },
    ],
  },
];

export function getTemplateById(id: string): LandingPageTemplate | undefined {
  return landingPageTemplates.find((template) => template.id === id);
}

export function getTemplatesByCategory(
  category: LandingPageTemplate["category"]
): LandingPageTemplate[] {
  return landingPageTemplates.filter((template) => template.category === category);
}
