import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - EduMate" },
      { name: "description", content: "EduMate's privacy policy - How we protect your educational data and privacy." },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
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
                <h1 className="font-semibold">Privacy Policy</h1>
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
                EduMate is committed to protecting your privacy and ensuring the security of your personal and academic information. 
                This Privacy Policy explains how we collect, use, and safeguard your data when you use our AI-powered educational platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Enrollment number and student identification</li>
                    <li>Name and contact information</li>
                    <li>Academic details (semester, branch, subjects)</li>
                    <li>Authentication credentials</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Academic Data</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Attendance records and patterns</li>
                    <li>Assessment marks and performance data</li>
                    <li>Subject-wise academic progress</li>
                    <li>Study-related interactions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Usage Data</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Chat conversations with AI mentor</li>
                    <li>Platform usage patterns and preferences</li>
                    <li>Technical access logs and device information</li>
                    <li>Performance and analytics data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Core Services</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Provide personalized AI mentorship and guidance</li>
                    <li>Track and analyze academic performance</li>
                    <li>Generate attendance and progress reports</li>
                    <li>Offer study recommendations and insights</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Platform Improvement</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Enhance AI responses and accuracy</li>
                    <li>Improve user experience and interface</li>
                    <li>Develop new educational features</li>
                    <li>Conduct research and analysis</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Data Security</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
                  <li><strong>Access Controls:</strong> Strict authentication and authorization protocols</li>
                  <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                  <li><strong>Data Minimization:</strong> Only collect necessary information</li>
                  <li><strong>Secure Infrastructure:</strong> Enterprise-grade cloud security</li>
                </ul>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Data Sharing</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We do not sell, rent, or share your personal information with third parties for marketing purposes. 
                  We only share data in limited circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Academic Institutions:</strong> With your educational institution for official purposes</li>
                  <li><strong>Service Providers:</strong> With trusted third-party services necessary for operation</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Research:</strong> Anonymized data for educational research and improvement</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You have the following rights regarding your data:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Access:</strong> Request access to your personal data</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Objection:</strong> Object to certain data processing activities</li>
                </ul>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We retain your data only as long as necessary for the purposes outlined in this policy:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Academic data: Retained while you are actively using the service</li>
                  <li>Chat history: Retained for 365 days from last interaction</li>
                  <li>Account information: Retained until account deletion</li>
                  <li>Analytics data: Retained in anonymized form for improvement</li>
                </ul>
              </div>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new policy on this page and updating the "Last updated" date. 
                Significant changes will be communicated through email or platform notifications.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have questions about this Privacy Policy or need to exercise your rights, please contact us:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p><strong>Email:</strong> privacy@edumate.com</p>
                  <p><strong>Address:</strong> EduMate Privacy Team</p>
                  <p><strong>Response Time:</strong> We respond within 30 days</p>
                </div>
              </div>
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
