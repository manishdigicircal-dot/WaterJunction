import { FiShield, FiLock, FiEye, FiDatabase, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 relative overflow-hidden">
      {/* Water Wave Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M0,400 C300,300 600,500 900,400 C1050,350 1125,450 1200,400 L1200,800 L0,800 Z" fill="url(#wave-gradient-privacy)" opacity="0.4"></path>
          <path d="M0,500 C300,400 600,600 900,500 C1050,450 1125,550 1200,500 L1200,800 L0,800 Z" fill="url(#wave-gradient-privacy)" opacity="0.3"></path>
          <defs>
            <linearGradient id="wave-gradient-privacy" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 rounded-full blur-xl opacity-50"></div>
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-2xl ring-4 ring-cyan-100">
                <FiShield className="text-white text-2xl" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Privacy Policy Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8 lg:p-10">
            
            {/* Interpretation Section */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center">
                <FiLock className="text-cyan-600 mr-3" />
                Interpretation
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
              </p>
            </section>

            {/* Definitions Section */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center">
                <FiDatabase className="text-cyan-600 mr-3" />
                Definitions
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For the purposes of this Privacy Policy:
              </p>
              <div className="space-y-4">
                <div className="bg-cyan-50/50 rounded-lg p-4 border-l-4 border-cyan-500">
                  <p className="font-semibold text-gray-900 mb-1">Account</p>
                  <p className="text-gray-700 text-sm">means a unique account created for You to access our Service or parts of our Service.</p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-900 mb-1">Affiliate</p>
                  <p className="text-gray-700 text-sm">means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>
                </div>
                <div className="bg-cyan-50/50 rounded-lg p-4 border-l-4 border-cyan-500">
                  <p className="font-semibold text-gray-900 mb-1">Company</p>
                  <p className="text-gray-700 text-sm">(referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to The Water Junction.</p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-900 mb-1">Cookies</p>
                  <p className="text-gray-700 text-sm">are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</p>
                </div>
                <div className="bg-cyan-50/50 rounded-lg p-4 border-l-4 border-cyan-500">
                  <p className="font-semibold text-gray-900 mb-1">Country</p>
                  <p className="text-gray-700 text-sm">refers to: Gautam Buddha Nagar, Uttar Pradesh, India</p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-900 mb-1">Device</p>
                  <p className="text-gray-700 text-sm">means any device that can access the Service such as a computer, a cellphone or a digital tablet.</p>
                </div>
                <div className="bg-cyan-50/50 rounded-lg p-4 border-l-4 border-cyan-500">
                  <p className="font-semibold text-gray-900 mb-1">Personal Data</p>
                  <p className="text-gray-700 text-sm">is any information that relates to an identified or identifiable individual.</p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-900 mb-1">Service</p>
                  <p className="text-gray-700 text-sm">refers to the Website.</p>
                </div>
                <div className="bg-cyan-50/50 rounded-lg p-4 border-l-4 border-cyan-500">
                  <p className="font-semibold text-gray-900 mb-1">Service Provider</p>
                  <p className="text-gray-700 text-sm">means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-900 mb-1">Usage Data</p>
                  <p className="text-gray-700 text-sm">refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</p>
                </div>
                <div className="bg-cyan-50/50 rounded-lg p-4 border-l-4 border-cyan-500">
                  <p className="font-semibold text-gray-900 mb-1">Website</p>
                  <p className="text-gray-700 text-sm">refers to The Water Junction, accessible from <a href="https://thewaterjunction.com/" className="text-cyan-600 hover:underline" target="_blank" rel="noopener noreferrer">https://thewaterjunction.com/</a></p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-900 mb-1">You</p>
                  <p className="text-gray-700 text-sm">means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>
                </div>
              </div>
            </section>

            {/* Collecting and Using Your Personal Data */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center">
                <FiEye className="text-cyan-600 mr-3" />
                Collecting and Using Your Personal Data
              </h2>
              
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Types of Data Collected</h3>
              
              <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Personal Data</h4>
              <p className="text-gray-700 leading-relaxed mb-4">
                While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                <li>Email address</li>
                <li>First name and last name</li>
                <li>Phone number</li>
                <li>Address, State, Province, ZIP/Postal code, City</li>
              </ul>

              <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Usage Data</h4>
              <p className="text-gray-700 leading-relaxed mb-4">
                Usage Data is collected automatically when using the Service.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device.
              </p>
            </section>

            {/* Tracking Technologies and Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Tracking Technologies and Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies We use may include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                <li><strong>Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service.</li>
                <li><strong>Web Beacons.</strong> Certain sections of our Service and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use both Session and Persistent Cookies for the purposes set out below:
              </p>
              <div className="space-y-3">
                <div className="bg-cyan-50/50 rounded-lg p-4 border-l-4 border-cyan-500">
                  <p className="font-semibold text-gray-900 mb-1">Necessary / Essential Cookies</p>
                  <p className="text-gray-700 text-sm mb-2">Type: Session Cookies</p>
                  <p className="text-gray-700 text-sm">Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts.</p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-900 mb-1">Cookies Policy / Notice Acceptance Cookies</p>
                  <p className="text-gray-700 text-sm mb-2">Type: Persistent Cookies</p>
                  <p className="text-gray-700 text-sm">Purpose: These Cookies identify if users have accepted the use of cookies on the Website.</p>
                </div>
                <div className="bg-cyan-50/50 rounded-lg p-4 border-l-4 border-cyan-500">
                  <p className="font-semibold text-gray-900 mb-1">Functionality Cookies</p>
                  <p className="text-gray-700 text-sm mb-2">Type: Persistent Cookies</p>
                  <p className="text-gray-700 text-sm">Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference.</p>
                </div>
              </div>
            </section>

            {/* Use of Your Personal Data */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Use of Your Personal Data</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Company may use Personal Data for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                <li>To provide and maintain our Service, including to monitor the usage of our Service.</li>
                <li>To manage Your Account: to manage Your registration as a user of the Service.</li>
                <li>For the performance of a contract: the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased.</li>
                <li>To contact You: To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication.</li>
                <li>To provide You with news, special offers and general information about other goods, services and events which we offer.</li>
                <li>To manage Your requests: To attend and manage Your requests to Us.</li>
                <li>For business transfers: We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets.</li>
                <li>For other purposes: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share Your personal information in the following situations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                <li>With Service Providers: We may share Your personal information with Service Providers to monitor and analyze the use of our Service.</li>
                <li>For business transfers: We may share or transfer Your personal information in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition.</li>
                <li>With Affiliates: We may share Your information with Our affiliates.</li>
                <li>With business partners: We may share Your information with Our business partners to offer You certain products, services or promotions.</li>
                <li>With other users: when You share personal information or otherwise interact in the public areas with other users.</li>
                <li>With Your consent: We may disclose Your personal information for any other purpose with Your consent.</li>
              </ul>
            </section>

            {/* Retention of Your Personal Data */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Retention of Your Personal Data</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.
              </p>
            </section>

            {/* Transfer of Your Personal Data */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Transfer of Your Personal Data</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from Your jurisdiction.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.
              </p>
            </section>

            {/* Delete Your Personal Data */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Delete Your Personal Data</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Service may give You the ability to delete certain information about You from within the Service.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may update, amend, or delete Your information at any time by signing in to Your Account, if you have one, and visiting the account settings section that allows you to manage Your personal information. You may also contact Us to request access to, correct, or delete any personal information that You have provided to Us.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.
              </p>
            </section>

            {/* Disclosure of Your Personal Data */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Disclosure of Your Personal Data</h2>
              
              <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">Business Transactions</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">Law enforcement</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">Other legal requirements</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                <li>Comply with a legal obligation</li>
                <li>Protect and defend the rights or property of the Company</li>
                <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                <li>Protect the personal safety of Users of the Service or the public</li>
                <li>Protect against legal liability</li>
              </ul>
            </section>

            {/* Security of Your Personal Data */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Security of Your Personal Data</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13 without verification of parental consent, We take steps to remove that information from Our servers.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a parent, We may require Your parent's consent before We collect and use that information.
              </p>
            </section>

            {/* Links to Other Websites */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Links to Other Websites</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
              </p>
            </section>

            {/* Changes to this Privacy Policy */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Changes to this Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            {/* Contact Us */}
            <section className="mb-8 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center">
                <FiMail className="text-cyan-600 mr-3" />
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, You can contact us:
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FiMail className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">By email:</p>
                    <a href="mailto:waterjunction514@gmail.com" className="text-cyan-600 hover:text-cyan-700 hover:underline">
                      waterjunction514@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiMapPin className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">By visiting this page:</p>
                    <a href="/contact" className="text-cyan-600 hover:text-cyan-700 hover:underline">
                      https://thewaterjunction.com/contact-us/
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiPhone className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">By phone number:</p>
                    <a href="tel:+919873745273" className="text-cyan-600 hover:text-cyan-700 hover:underline">
                      +91 98737 45273
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiMapPin className="h-5 w-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">By Address:</p>
                    <p className="text-gray-700">
                      Ground Floor, Khasra No - 146, Dudeshwar Enclave, Vill - Chipiana Tigri, Opposite - 14th Avenue, Gaur City, Gautam Buddha Nagar, Uttar Pradesh, 201301
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;












