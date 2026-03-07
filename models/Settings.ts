import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    branding: {
        siteName: { type: String, default: 'Thulira' },
        tagline: { type: String, default: 'Sustainable Living' },
        logo: { type: String, default: '/logo.png' },
        favicon: { type: String, default: '/favicon.ico' }
    },
    contact: {
        supportEmail: { type: String, default: 'support@thulira.com' },
        supportPhone: { type: String, default: '+91 9087352282' },
        whatsappNumber: { type: String, default: '+91 9087352282' },
        address: { type: String, default: '123 Green Street, Eco City, EC 123456' }
    },
    social: {
        instagram: { type: String, default: 'https://www.instagram.com/thulira' },
        facebook: { type: String, default: 'https://facebook.com/thulira' },
        twitter: { type: String, default: 'https://twitter.com/thulira' }
    },
    policies: {
        gstPercentage: { type: Number, default: 18 },
        freeShippingThreshold: { type: Number, default: 500 },
        baseShippingCost: { type: Number, default: 50 },
        termsAndConditions: {
            type: String,
            default: `Terms of Use

The use of any service or feature available through the internet website accessible at www.thulira.com (hereafter referred as “Website”) by any user of the Website (hereafter referred as “You”) shall be governed by the following Terms of Use (referred as “Terms”):

This Website is provided by Thulira (hereinafter referred to as “Thulira”), and shall be used for informational purposes only. By using the Website, You hereby agree to abide by the Terms. In the event of You not agreeing to these Terms, You are requested by Thulira not to use the Website.

This Website, including all Materials present (excluding any applicable third party materials), is the property of Thulira. You hereby agree to comply with all copyright laws worldwide in Your use of this Website and to prevent any unauthorized copying of the Materials.

Thulira has business relationships with several customers, partners, suppliers, agencies, agents and others. For convenience and simplicity, words like joint venture, partnership, and partner are used to indicate business relationships involving common activities and interests, and those words may not indicate precise legal relationships.

Terms provided is subject to change without notice.

LIMITED LICENSE:
Subject to the Terms, Thulira grants You a non-exclusive, non-transferable, limited right to access, use and display this Website and the Materials thereon. You agree not to interrupt or attempt to interrupt the operation of the Website in any manner. Unless otherwise specified, the Website is for Your personal and non-commercial use. You shall not use the information obtained from this Website in any form for commercial purpose.

THIRD PARTY CONTENT:
The Website makes information of third parties available, including articles, images, analyst reports, news reports, tools to facilitate calculation, company information and data about financial markets, including any regulatory authority and other financial markets and other data from external sources (the “Third Party Content”). You acknowledge and agree that the Third Party Content is not created or endorsed by Thulira. The provision of Third Party Content is for general informational purposes only. You acknowledge that the Third Party Content provided to You is obtained from sources believed to be reliable, but that no guarantees are made by Thulira or the providers of the Third Party Content as to its accuracy, completeness, timeliness. You agree not to hold Thulira liable for any decision and transactions You may make based on Your reliance on or use of such data, or any liability that may arise due to delays or interruptions in the delivery of the Third Party Content for any reason.

By using any Third Party Content, You may leave this Website and be directed to an external website, or to a website maintained by an entity other than Thulira. If You decide to visit any such site, You do so at Your own risk and it is Your responsibility to take all protective measures to guard against viruses or any other destructive elements. Thulira makes no warranty or representation regarding, and does not endorse, any linked Websites or the information appearing thereon or any of the products or services described thereon. Links do not imply that Thulira or this Website sponsors, endorses, is affiliated or associated with, or is legally authorized to use any trademark, trade name, logo or copyright symbol displayed in or accessible through the links, or that any linked site is authorized to use any trademark, trade name, logo or copyright symbol of Thulira or any of its affiliates or subsidiaries. You hereby expressly acknowledge and agree that the linked sites are not under the control of Thulira and Thulira is not responsible for the contents of any linked site or any link contained in a linked site, or any changes or updates to such sites. Thulira is providing these links to You only as a convenience, and the inclusion of any link shall not be construed to imply endorsement by Thulira in any manner of the website.

NO WARRANTIES:
This website, the information and materials on the site are provided “as is” without any representation or warranty, express or implied, of any kind, including, but not limited to, warranties of merchantability, non-infringement, or fitness for any particular purpose. There is no warranty of any kind, express or implied, regarding third party content. In spite of Thulira’s best endeavours, there is no warranty on behalf of Thulira that this Website will be free of any computer viruses.

LIMITATION OF DAMAGES:
In no event shall Thulira or any of its subsidiaries or affiliates or partners or clients or agents be liable to any entity or individual for any direct, indirect, special, consequential or other damages that are related to the use of, or the inability to use, the content, materials, and functions of this Website or any linked Website.

DISCLAIMER:
The website may contain inaccuracies and typographical and clerical errors. Thulira expressly disclaims any obligation(s) to update this website or any of the materials on this website. Thulira does not warrant the accuracy or completeness of the materials or the reliability of any advice, opinion, statement or other information displayed or distributed through the Website. You acknowledge that any reliance on any such opinion, advice, statement, memorandum, or information shall be at your sole risk. Thulira reserves the right, in its sole discretion, to correct any errors or omissions in any portion of the Website. Thulira may make any other changes to the Website, the materials and the products, programs, services or prices (if any) described in the Website at any time without notice. This Website is for informational purposes only and should not be construed as technical advice of any manner.

The images in the website are representative and general information purpose only and not used for commercial purpose. For further clarity, better understanding and interpretation of the images used and the information shared, You should contact Thulira.

This website may include forward-looking statements. These forward-looking statements involve known and unknown risks, uncertainties and other factors, which may cause actual results, performance, achievements to be materially different from those expressed or implied by these forward-looking statements. Thulira expressly disclaim any obligation or undertaking to release any update of, or revisions to, any forward-looking statements in this Website.

LAWFUL AND / OR PROHIBITED USE OF THE WEBSITE:
As a condition of Your use of the Website, You shall not use the Website for any purpose(s) that is unlawful or prohibited by the Terms. You shall not use the Website in any manner that could damage, disable, overburden, or impair the Website. You shall not attempt to gain unauthorized access to any section of the Website, other accounts, computer systems or networks connected to the Website, through hacking, password mining or any other means. You shall not obtain or attempt to obtain any Materials or information through any means not intentionally made available through the Website.

INDEMNITY:
You agree to indemnify and hold harmless Thulira, its subsidiaries, clients, agents, agencies, partners and affiliates from any claim, cost, expense, judgment or other loss relating to Your use of this Website in any manner, including without limitation of the foregoing, any action You take which is in violation of the Terms and against any applicable law.

INTERNATIONAL USERS AND CHOICE OF LAW:
This Site is controlled, operated and administered by Thulira from its offices within India. Thulira makes no representation that Materials on this Website are appropriate or available for use at any other location(s) outside India. Any access to this Website from territories where their contents are illegal is prohibited. You may not use the Website or export the Materials in violation of any applicable export laws and regulations. If You access this Website from a location outside India, You are responsible for compliance with all local laws.

These Terms shall be governed by the laws of India, without giving effect to its conflict of laws provisions. You agree that the appropriate court(s) in Bangalore, India, will have the exclusive jurisdiction to resolve all disputes arising under these Terms and You hereby consent to personal jurisdiction in such forum.

These Terms constitutes the entire agreement between Thulira and You with respect to Your use of the Website.`
        },
        privacyPolicy: {
            type: String,
            default: `Privacy Policy

Thulira operates the www.thulira.com website (the “Service”). This page informs you of our policies regarding the collection, use and disclosure of Personal Information when you use our Service.

We will not use or share your information with anyone except as described in this Privacy Policy. We use your Personal Information for providing and improving the Service. By using the Service, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy Policy, terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, accessible at www.thulira.com.

INFORMATION COLLECTION AND USE
While using our Service, we may ask you to provide us with certain personally identifiable information, we collect the personal information you give us such as your name, address and email address. Personally identifiable information may include, but is not limited to, your email address, name, phone number, postal address.

The purpose for which we collect personal information is to provide you with the best service experience possible on the Service and for our internal business purposes that form part of normal business practices. Some provision of personal information is optional. However, if you do not provide us with certain types of personal information, you may be unable to enjoy the full functionality of the Service.

EMAIL MARKETING
With your permission, we may send you emails about our store, new products and other updates.

CONSENT
You hereby expressly and voluntarily grant your informed consent to us to deal with your personal information in accordance with the terms and conditions of this Privacy Policy. Should you retract your consent, please contact us. If you retract your consent, you acknowledge and agree that failure to provide certain types of personal information may not give you access to the full functionality of the Service.

LOG DATA
When you browse our store, we also automatically receive your computer’s internet protocol (IP) address in order to provide us with information that helps us learn about your browser and operating system. In addition, we may use third party services such as Google Analytics that collect, monitor and analyse this type of information in order to increase our Service’s functionality. These third party service providers have their own privacy policies addressing how they use such information.

COOKIES
Cookies are files with small amount of data, which may include an anonymous unique identifier. Cookies are sent to your browser from a web site and stored on your computer’s hard drive. We use “cookies” to collect information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.

CHANGES TO THIS PRIVACY POLICY
We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website. If we make material changes to this policy, we will notify you here that it has been updated, so that you are aware of what information we collect, how we use it, and under what circumstances, if any, we use and/or disclose it.

SERVICE PROVIDERS
We may employ third party companies and individuals to facilitate our Service, to provide the Service on our behalf, to perform Service-related services or to assist us in analysing how our Service is used. These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.

COMMUNICATIONS
We may use your Personal Information to contact you with newsletters, marketing or promotional materials and other information that may be of interest to you. You may opt out of receiving any, or all, of these communications from us by following the unsubscribe link or instructions provided in any email we send.

LINKS
When you click on links on our store, they may direct you away from our site. We are not responsible for the privacy practices of other sites and encourage you to read their privacy statements.

DATA SHARING
We are not responsible for the user terms or activities of third party sites. However, Thulira will not sell your information nor permit others to do so. We will not share your information with any third party except as stated in this Privacy Notice or as required to operate our social media sites, provide our services and/or products to you and/or administer your account.

SECURITY
To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered or destroyed.

AGE OF CONSENT
By using this site, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.

QUESTIONS AND CONTACT INFORMATION
If you would like to: access, correct, amend or delete any personal information we have about you, please contact us at support@thulira.com.`
        }
    },
    status: {
        maintenanceMode: { type: Boolean, default: false }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const SettingsModel = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export default SettingsModel as mongoose.Model<any>;
