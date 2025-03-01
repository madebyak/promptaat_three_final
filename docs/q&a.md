# Promptaat Project Q&A

## 1. Database Architecture & Backend Separation

Q1.1: Should the main platform and admin panel share the same PostgreSQL instance but with different schemas?
Answer: Yes because i want the admin to add / edit/ remove :  categories, Subcategories, tools , and prompts from the admin panel, note that users won't add prompts, only the admin will. 

Q1.2: Do you want completely separate PostgreSQL databases on Railway?
Answer: Yes i already established one 

Q1.3: What level of data synchronization will be needed between these two systems?
Answer: Real-time sync: Changes are reflected immediately across both systems 

## 2. Authentication Flow

Q2.1: Will you offer only OTP-based authentication or also include traditional email/password?
Answer: User on-boarding or / regsitering will be as the following
Users will be email to signup with email or signup with google gmail 
with email we will ask for  
First Name - Last Name
Email
Password
Country (drop down with all countries and flags and built in search)
Agree for terms and conditions
Create account
Then user will get> input OTP to verifiy your email ( at the same time we will send them email using resend.com with OTP code)

Q2.2: Do you want social auth options (Google, GitHub, etc.) in addition to OTP?
Answer:  only Google 

Q2.3: What authentication method do you prefer for the admin panel? (JWT, Session-based, etc.)
Answer: JWT

Q2.4: Will you need role-based access control for different admin users?
Answer: yes two admins or 3 Maximum 

## 3. Prompt Management

Q3.1: What specific fields should each prompt contain?
Answer:  Prompt Title English - Prompt Title Arabic - Description English - Description arabic - Prompt text English - Prompt text Arabic - Instruction text English - Instruction text Arabic - Prompt type (Free / pro) counter input form to put counter for user copying to prompt ( for example if we create new prompt and put 3000 as counter, the copy clicks counter will start countring from 3k) - assign categories and subcategories (each prompt can be assigned to multiple categories and Subcategories ) -  Assigned Tools ( as we have different schema or table in the database called tools and we control it from the admin panel we will fetch these tools and show them in multi-selector menu when user can find all the tolls and select from them to assign prompt to it) - last but not least we will have keyword input form to add keywords to help for better search experience 

Q3.2: Will prompts have versioning?
Answer: we will udpate prompts, so yes we will have versioning or we will show last update : date 

Q3.3: Do you need analytics on prompt usage/effectiveness?
Answer: we can't measure Effectiveness, we will be able to measure usage by counting how many times user copy these prompts 

Q3.4: How will the "Pro" designation work - will it be at the prompt level or category level?
Answer: It will be prompt type has nothing to do with the category

## 4. Search & Filtering

Q4.1: Do you want full-text search capabilities?
Answer: if possible yes, if it's complicated and effect Performance let's stick with searching based on words in the prompt title, prompt keywords, prompt categories subcategories and tools 

Q4.2: Should the search include prompt content or just titles/descriptions?
Answer: just title description and keywords which are in the prompt database tables / fields

Q4.3: Will you need search result ranking based on popularity/relevance?
Answer: Yes i will need a sort by drop down beside the search input to sort by most popular, newest and most used 

Q4.4: Do you want to implement type-ahead suggestions?
Answer: no

## 5. User Features

Q5.1: What user profile data do you want to collect?
Answer: First Name - last name - Email - password- Country - and if possible we have occupation or field of work something like this 

Q5.2: Will users have public profiles?
Answer: No

Q5.3: How will the bookmark system work - private only or with sharing capabilities?
Answer: private for now 

Q5.4: For history tracking, how long should the history be retained?
Answer: Keep last 30 items per user

## 6. Internationalization

Q6.1: Will all content (including prompts) be available in both English and Arabic?
Answer: Yes, but translations for categories / Subcategories / prompts will be done from the admin panel ( reading above prompt input forms in the admin panel will makes sense for you)

Q6.2: Who will manage translations - admins or through automated services?
Answer: admins

Q6.3: Will the admin panel also need RTL support?
Answer: No just english for admin 

## 7. Future Considerations

Q7.1: What metrics will determine prompt popularity?
Answer: counter of copies

Q7.2: How will you handle the transition of free prompts to pro?
Answer: Some prompts they will be sets as free and some will be sets as pro when we add them, that form i mentioned above in the prompt management, when a prompt is free, free users can copy it but they can the pro prompts blurry until they subscribe
Q7.3: Will there be different subscription tiers?
Answer: We will have Monthly , 3 months ,  Yearly 

Q7.4: Do you have an estimated user base size for initial launch?
Answer: maybe 10000 up to 50000

Q7.5: What's your expected growth rate?
Answer: not sure maybe 50%

Q7.6: Do you need analytics for business metrics?
Answer: Yes

## 8. Admin Panel Requirements

Q8.1: What specific analytics and reporting features do you need?
Answer: i would love to see you suggesting great stuff for me 

Q8.2: Do you need bulk operations for prompt management?
Answer: yes

Q8.3: Will you need a dashboard for monitoring user activity?
Answer: yes

Q8.4: What kind of user management features do you need?
Answer: suggest thigns for me 



## Additional Clarifying Questions

Q9.1: Should we implement soft delete for entities (prompts, categories, etc.)?
Answer: yes

Q9.2: Given the user base estimate (10,000-50,000), should we implement Elasticsearch or stick with PostgreSQL full-text search?
Answer:  Not sure what you mean, you make decision but i do like PostgreSQL 

Q9.3: For pro prompts preview:
- Will pro users see a preview of the prompt before copying? yes of course Pro users will have full access on all website content, just free users will not be able to see the pro prompt text, free users will be able to see pro prompt cards and read its title and categories and tools and everything , the only thing they won't have access to is to copy to prompt or see it at any way 
- Should we show any metadata (length, category, etc.) for pro prompts to free users? answered above 
- Will pro prompts have any special visual indicators in the UI?
Answer:  Yes we will have Pro label in the prompt card and prompt modal popup page 

## Suggested Analytics Features
Q10.1: Would you like to track these analytics metrics? 
- Daily/Monthly Active Users
- Most popular prompts/categories
- Subscription conversion rates
- User engagement metrics (time spent, prompts copied)
- Geographic distribution of users
- Search term analytics
Answer: YES PERFECT 

## Suggested User Management Features
Q10.2: Would these user management features meet your needs?
- User list with filtering and search
- User status management (active/suspended)
- Subscription management
- User activity logs
- Bulk user operations
- Export user data functionality
Answer: YES great 

## Categories and Tools Management

Q11.1: For Categories Management:
- How many levels of categories do you need? (main categories, subcategories, etc.)
Answer: we have Main category - below it we will have many Subcategories 
- Will categories have images/icons? Only main categories will have icons 
- Can a subcategory belong to multiple main categories? No
- Do you need category sorting/ordering capabilities? In the admin panel yes i need order with drag drop sorting 

Q11.2: For Tools Management:
- What information do we need to store for each AI tool? (name, logo, website, etc.)
Answer: Tool name (En only) , Icon URL (PNG, JPEG, SVG, ICO), WEbsite URL, and of course tool ID that auto generated 
- Will tools have categories/types? No just normal listing 
- Do you need to track which tools are most popular? Yes in the dashboard
- Should tools have status (active/inactive)? No 


## UI/UX Features

Q12.1: Homepage Layout:
- What sections should the homepage include?
Answer: Navigation bar, Left side menu , Main section which will have small height banner and search row , and prompt cards grid
- Do you want featured/trending prompts section?
Answer: No need as we will have sort by button
- Should we show categories as cards or in a dropdown?
Answer: Left side menu
- Do you want a hero section with search as the main focus?
Answer: Not sure 

Q12.2: Prompt Cards Display:
- What information should be visible on the prompt card without opening it?
Answer : Basic / Pro label - Prompt Title - Prompt text - Assigned categoires Subcategories  - assigned tools - counter - copy button - bookmark icon 
- Should we show the number of copies/bookmarks on the card?
Answer: Yes 
- Do you want filtering options to be sticky/always visible?
Answer: no
- How should we handle long prompt titles/descriptions?
Answer: in the homepage prompt cards we will show part of the prompt and end it with "..." so limited characters, but for the prompt modal we will show the full prompt text

Q12.3: User Interface Preferences:
- Should the theme switcher (dark/light) be prominent or in a menu?
Answer: in the menu using shadcn single toggle group (Dark, Bright)
- Do you want a quick language switcher in the header?
Answer : Yes dropdown menu showing only flags UK and IRAQ 
- Should we implement keyboard shortcuts for power users?
Answer: no
- Do you want infinite scroll or pagination for prompt listings?
Answer: Whatever you suggest makes the website user-friendly and fast performance

Q12.4: Mobile Experience:
- Should we implement a mobile app later or focus on responsive web?
Answer: Focus on resposnive web from beggnign to avoid performance issues, i suggest everypage we finish its UI you should remind me to go all over and do the mobile version of it 
- Do you want to implement share-to-mobile features?
Answer: no
- Should we optimize prompt copying for mobile users?
Answer: yes
- Do you want mobile-specific features?
Answer: Yes i want all of them to ensure we have great mobile user experience 

Q12.5: Social and Community Features:
- Do you want to implement prompt sharing on social media?
Answer: yes 
- Should users be able to report inappropriate prompts?
Answer: yes
- Do you want to implement a feedback system for prompts?
Answer: that would be nice , but make sure we have it small icon 
- Should we add a newsletter subscription feature?
Answer: yes let's do it
