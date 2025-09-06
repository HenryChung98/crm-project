"use client";
import { useRouter } from "next/navigation";
import { IoMdStar } from "react-icons/io";

export default function Home() {
  const router = useRouter();
  const features = [
    {
      // icon: <Users className="w-8 h-8" />,
      title: "고객 관리",
      description: "통합된 고객 데이터베이스로 모든 고객 정보를 한 곳에서 관리하세요.",
    },
    {
      // icon: <BarChart3 className="w-8 h-8" />,
      title: "실시간 분석",
      description: "강력한 분석 도구로 비즈니스 성과를 실시간으로 추적하고 개선하세요.",
    },
    {
      // icon: <Shield className="w-8 h-8" />,
      title: "보안",
      description: "엔터프라이즈급 보안으로 고객 데이터를 안전하게 보호합니다.",
    },
    {
      // icon: <Zap className="w-8 h-8" />,
      title: "자동화",
      description: "반복적인 작업을 자동화하여 효율성을 극대화하세요.",
    },
  ];

  const testimonials = [
    {
      name: "김민수",
      company: "테크스타트업",
      content: "CRMPro 덕분에 고객 관리가 정말 쉬워졌습니다. 매출이 30% 증가했어요!",
      rating: 5,
    },
    {
      name: "이서연",
      company: "마케팅에이전시",
      content: "직관적인 인터페이스와 강력한 기능들이 정말 인상적입니다.",
      rating: 5,
    },
    {
      name: "박준호",
      company: "이커머스",
      content: "고객 데이터 분석 기능이 비즈니스 결정에 큰 도움이 되고 있습니다.",
      rating: 5,
    },
  ];

  return (
    <div className="">
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Start Simply
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Grow Faster
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
            Transform customer relationships and accelerate business growth with us
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              className="group bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center gap-2"
              onClick={() => router.push("/auth/signup")}
            >
              Start for free
            </button>

            <button className="group flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
              View demo
            </button>
          </div>

          <div className="mt-16 text-sm opacity-75">
            <p>Credit card is not required • Cancellation available at any time</p>
          </div>
        </div>
      </section>
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">강력한 기능들</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              비즈니스 성장에 필요한 모든 CRM 기능을 한 곳에서 만나보세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div> */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10,000+</div>
              <div className="text-blue-200">활성 사용자</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">99.9%</div>
              <div className="text-blue-200">업타임</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-blue-200">통합 서비스</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">고객 지원</div>
            </div>
          </div>
        </div>
      </section>
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">고객들의 이야기</h2>
            <p className="text-xl text-gray-600">
              실제 사용자들이 경험한 CRMPro의 가치를 확인해보세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <IoMdStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Start Now</h2>
          <p className="text-xl mb-8 opacity-90">Try for free and experience features</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="border-2 border-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
              Sales consulting service
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
