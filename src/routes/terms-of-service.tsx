import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      { title: "Terms of Service - EduMate" },
      { name: "description", content: "EduMate's terms of service - Rules and guidelines for using our AI educational platform." },
    ],
  }),
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/chat"
              className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-brand flex items-center justify-center text-primary-foreground">
                <GraduationCap className="size-4" />
              </div>
              <div>
                <h1 className="font-semibold">Terms of Service</h1>
                <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="prose prose-gray max-w-none">
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to EduMate! These Terms of Service ("Terms") govern your use of our AI-powered educational platform. 
                By accessing or using EduMate, you agree to comply with and be bound by these Terms.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Acceptance of Terms</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  By using EduMate, you confirm that:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>You are at least 13 years of age or have parental consent</li>
                  <li>You have the legal capacity to enter into these Terms</li>
                  <li>You will comply with all applicable laws and regulations</li>
                  <li>You have read, understood, and agree to these Terms</li>
                </ul>
              </div>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Service Description</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  EduMate provides an AI-powered educational platform that includes:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Personalized AI mentorship and academic guidance</li>
                  <li>Attendance tracking and analysis</li>
                  <li>Academic performance monitoring</li>
                  <li>Study recommendations and insights</li>
                  <li>Interactive chat with educational AI assistant</li>
                </ul>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold mb-4">User Responsibilities</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Account Security</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Maintain confidentiality of your login credentials</li>
                    <li>Immediately notify us of unauthorized access</li>
                    <li>Not share your account with others</li>
                    <li>Keep your contact information updated</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Appropriate Use</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Use the service for educational purposes only</li>
                    <li>Provide accurate and truthful information</li>
                    <li>Respect intellectual property rights</li>
                    <li>Not attempt to circumvent security measures</li>
                    <li>Not use the service for illegal activities</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Prohibited Activities</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You are strictly prohibited from:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Attempting to hack or damage our systems</li>
                  <li>Using automated tools to access the service</li>
                  <li>Sharing or selling access to your account</li>
                  <li>Submitting false or misleading information</li>
                  <li>Harassing other users or our staff</li>
                  <li>Violating academic integrity policies</li>
                  <li>Interfering with service operation</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold mb-2">EduMate Property</h3>
                  <p>
                    EduMate owns all intellectual property rights in the service, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Platform software and technology</li>
                    <li>AI models and algorithms</li>
                    <li>User interface design</li>
                    <li>Brand names and trademarks</li>
                    <li>Documentation and training materials</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">User Content</h3>
                  <p>
                    You retain ownership of your academic data and content, but grant EduMate a license to:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Use your data to provide and improve services</li>
                    <li>Analyze anonymized data for research</li>
                    <li>Create aggregated insights and statistics</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Privacy and Data Protection */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Privacy and Data Protection</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Your privacy is important to us. Our use of your data is governed by our 
                  <Link to="/privacy-policy" className="text-primary hover:underline"> Privacy Policy</Link>, 
                  which forms part of these Terms.
                </p>
                <p>
                  We collect, use, and protect your information in accordance with applicable 
                  data protection laws and our commitment to educational privacy standards.
                </p>
              </div>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Service Availability</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We strive to provide reliable service, but please note:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Service may be temporarily unavailable for maintenance</li>
                  <li>We cannot guarantee 100% uptime</li>
                  <li>Features may change or be discontinued</li>
                  <li>Third-party services may affect availability</li>
                </ul>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  To the fullest extent permitted by law:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>EduMate is provided "as is" without warranties</li>
                  <li>We are not liable for indirect or consequential damages</li>
                  <li>Our liability is limited to fees paid for the service</li>
                  <li>We are not responsible for third-party content or services</li>
                  <li>Academic advice is guidance and not guaranteed</li>
                </ul>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Termination</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold mb-2">By You</h3>
                  <p>You may terminate your account at any time by:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Using the account deletion feature</li>
                    <li>Contacting our support team</li>
                    <li>Ceasing to use the service</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">By EduMate</h3>
                  <p>We may terminate or suspend your account for:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Violation of these Terms</li>
                    <li>Illegal or harmful activities</li>
                    <li>Extended inactivity</li>
                    <li>Non-payment of fees (if applicable)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these Terms periodically. Changes will be effective immediately upon posting. 
                We will notify users of significant changes through email or platform notifications. 
                Continued use of the service after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p><strong>Email:</strong> legal@edumate.com</p>
                  <p><strong>Address:</strong> EduMate Legal Team</p>
                  <p><strong>Response Time:</strong> We respond within 30 days</p>
                </div>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service are governed by and construed in accordance with applicable laws. 
                Any disputes arising from these Terms shall be resolved through good faith negotiation 
                and, if necessary, through appropriate legal channels.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} EduMate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
