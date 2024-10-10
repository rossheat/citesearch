
const Privacy: React.FC = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Privacy Policy for CiteSearch</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Introduction</h2>
          <p className="text-gray-800">CiteSearch ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application.</p>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Information We Collect</h2>
          <p className="text-gray-800">We collect the following types of information:</p>
          <ul className="list-disc pl-6 mt-2 text-gray-800">
            <li>The text you input for citation searches</li>
            <li>Search queries and results</li>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Usage data (e.g., pages visited, time spent on the site)</li>
          </ul>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. How We Use Your Information</h2>
          <p className="text-gray-800">We use the collected information to:</p>
          <ul className="list-disc pl-6 mt-2 text-gray-800">
            <li>Provide and maintain our service</li>
            <li>Improve and personalise user experience</li>
            <li>Analyse usage patterns and optimise our algorithms</li>
            <li>Communicate with you about service-related issues</li>
            <li>Prevent fraud and abuse of our service</li>
          </ul>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Data Storage and Security</h2>
          <p className="text-gray-800">We implement appropriate technical and organisational measures to protect your data. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Third-Party Services</h2>
          <p className="text-gray-800">We use third-party services for our application, including:</p>
          <ul className="list-disc pl-6 mt-2 text-gray-800">
            <li>Google Custom Search API for searching scientific articles</li>
            <li>PubMed API for retrieving article metadata</li>
            <li>OpenAI API for AI-powered analysis</li>
          </ul>
          <p className="mt-2 text-gray-800">These services may collect and process your data according to their own privacy policies.</p>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Cookies and Tracking</h2>
          <p className="text-gray-800">We do not use cookies for tracking purposes. However, our third-party providers may use cookies or similar tracking technologies. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies.</p>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Your Data Rights</h2>
          <p className="text-gray-800">Depending on your location, you may have certain rights regarding your personal data, including:</p>
          <ul className="list-disc pl-6 mt-2 text-gray-800">
            <li>The right to access your personal data</li>
            <li>The right to rectify inaccurate personal data</li>
            <li>The right to erasure ("right to be forgotten")</li>
            <li>The right to restrict processing of your personal data</li>
            <li>The right to data portability</li>
          </ul>
          <p className="mt-2 text-gray-800">To exercise these rights, please contact us using the information provided in the "Contact Us" section.</p>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Children's Privacy</h2>
          <p className="text-gray-800">Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.</p>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Changes to This Privacy Policy</h2>
          <p className="text-gray-800">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">10. Contact Us</h2>
          <p className="text-gray-800">If you have any questions about this Privacy Policy, please contact us at:</p>
          <p className="mt-2 text-gray-800">Email: hello@citesearch.org</p>
        </section>
  
        <p className="text-sm text-gray-600">Last updated: 9th October 2024</p>
      </div>
    );
  };

  export default Privacy;
  