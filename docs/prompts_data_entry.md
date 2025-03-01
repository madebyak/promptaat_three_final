# Prompts Data Entry

## Database Schema Reference
```sql
-- Main Prompt Fields
Prompt {
  // Required Fields
  titleEn           String    // English title
  titleAr           String    // Arabic title
  promptTextEn      String    // English prompt text
  promptTextAr      String    // Arabic prompt text
  
  // Optional Fields
  descriptionEn     String?   // English description
  descriptionAr     String?   // Arabic description
  instructionEn     String?   // English instructions
  instructionAr     String?   // Arabic instructions
  isPro             Boolean   // default: false
  copyCount         Int       // default: 0
  initialCopyCount  Int       // default: 0
  version           Int       // default: 1
}

-- Relations (Junction Tables)
PromptCategory {
  promptId       UUID
  categoryId     UUID
  subcategoryId  UUID?  // Optional for prompts without subcategory
}

PromptTool {
  promptId  UUID
  toolId    UUID
}

PromptKeyword {
  promptId  UUID
  keyword   String
}
```

## Prompts

### 1. Comprehensive Monthly Budget Planner
```yaml
# English Content
titleEn: "Comprehensive Monthly Budget Planner"
descriptionEn: "Create a detailed monthly budget based on income, expenses, and financial goals to optimize savings and manage expenses effectively."
promptTextEn: |
  Act as a financial planner and help me create a comprehensive monthly budget. Based on my income, expenses, savings goals, and financial obligations, design a structured budget that helps me manage my finances efficiently. Provide category-wise allocation and suggest ways to improve savings.

  To generate the best budget, provide the following details:
  •	[Your monthly income]
  •	[Your fixed expenses: rent, utilities, loans, etc.]
  •	[Your variable expenses: groceries, entertainment, dining, etc.]
  •	[Your savings goals: emergency fund, investments, retirement, etc.]
instructionEn: "Fill in the bracketed information with your actual financial details to get a personalized budget plan."

# Arabic Content
titleAr: "مخطط الميزانية الشهرية الشامل"
descriptionAr: "إنشاء ميزانية شهرية مفصلة بناءً على الدخل والمصروفات والأهداف المالية لتحسين الادخار وإدارة النفقات بشكل فعال."
promptTextAr: |
  تصرف كمخطط مالي وساعدني في إعداد ميزانية شهرية شاملة. بناءً على دخلي ونفقاتي وأهداف الادخار والالتزامات المالية، قم بتصميم ميزانية منظمة تساعدني في إدارة أموالي بكفاءة. قدم توزيعًا للفئات المختلفة واقترح طرقًا لتحسين الادخار.

  للحصول على أفضل ميزانية، يرجى تقديم التفاصيل التالية:
  •	[دخلك الشهري]
  •	[نفقاتك الثابتة: الإيجار، الفواتير، القروض، إلخ.]
  •	[نفقاتك المتغيرة: البقالة، الترفيه، الطعام خارج المنزل، إلخ.]
  •	[أهداف ادخارك: صندوق الطوارئ، الاستثمارات، التقاعد، إلخ.]
instructionAr: "املأ المعلومات بين الأقواس بتفاصيلك المالية الفعلية للحصول على خطة ميزانية مخصصة."

# Metadata
isPro: false
initialCopyCount: 100
copyCount: 150
version: 1

# Relations
categories:
  category: "Business & Marketing"
  subcategory: "Business Plans"
tools: 
  - ChatGPT
  - Claude
  - Gemini
  - Notion AI
  - Bing AI
keywords:
  - Budgeting
  - Savings
  - Financial Planning
  - Expense Management
  - Money Management
```

### 2. Debt Repayment Strategy
```yaml
# English Content
titleEn: "Debt Repayment Strategy"
descriptionEn: "Create a personalized debt repayment plan using proven strategies like snowball or avalanche methods to become debt-free efficiently."
promptTextEn: |
  Act as a financial advisor and help me create a strategic debt repayment plan. Based on my total debt amount, types of debt, and income, develop an organized repayment strategy that helps me become debt-free efficiently. Consider methods like the snowball method (paying off smallest debts first) or avalanche method (focusing on highest interest rates first).

  To create the best plan, provide:
  •	[List of your debts with balances and interest rates]
  •	[Your monthly income]
  •	[Amount available for debt repayment]
  •	[Preferred repayment strategy (snowball/avalanche)]
instructionEn: "Fill in the bracketed information with your actual debt details to get a personalized repayment strategy."

# Arabic Content
titleAr: "استراتيجية سداد الديون"
descriptionAr: "إنشاء خطة مخصصة لسداد الديون باستخدام استراتيجيات مثبتة مثل طريقة كرة الثلج أو الانهيار للتخلص من الديون بكفاءة."
promptTextAr: |
  تصرف كمستشار مالي وساعدني في إنشاء خطة استراتيجية لسداد الديون. بناءً على إجمالي مبلغ الدين وأنواع الديون والدخل، قم بتطوير استراتيجية سداد منظمة تساعدني في التخلص من الديون بكفاءة. ضع في اعتبارك طرقًا مثل كرة الثلج (سداد أصغر الديون أولاً) أو الانهيار (التركيز على أعلى معدلات الفائدة أولاً).

  لإنشاء أفضل خطة، قدم:
  •	[قائمة ديونك مع الأرصدة ومعدلات الفائدة]
  •	[دخلك الشهري]
  •	[المبلغ المتاح لسداد الديون]
  •	[استراتيجية السداد المفضلة (كرة الثلج/الانهيار)]
instructionAr: "املأ المعلومات بين الأقواس بتفاصيل ديونك الفعلية للحصول على استراتيجية سداد مخصصة."

# Metadata
isPro: false
initialCopyCount: 80
copyCount: 120
version: 1

# Relations
categories:
  category: "Business & Marketing"
  subcategory: "Business Plans"
tools:
  - ChatGPT
  - Claude
  - Gemini
  - Notion AI
keywords:
  - Debt Management
  - Financial Strategy
  - Debt Free
  - Money Management
  - Personal Finance
```

### 3. Emergency Fund Planning
```yaml
# English Content
titleEn: "Emergency Fund Planning"
descriptionEn: "Create a step-by-step plan to build an emergency fund that covers essential expenses for a specific period."
promptTextEn: |
  I want to build an emergency fund to cover unexpected expenses. Based on my monthly expenses and savings capacity, help me determine how much I should save, set a realistic goal, and suggest ways to consistently contribute to the fund.
  
  To generate the best plan, provide:
  •	[Your monthly essential expenses]
  •	[Your current savings]
  •	[Your monthly savings capacity]
  •	[Desired emergency fund coverage (e.g., 3 months, 6 months)]
instructionEn: "Fill in the bracketed information with your actual financial details to get a personalized emergency fund plan."

# Arabic Content
titleAr: "تخطيط صندوق الطوارئ"
descriptionAr: "إنشاء خطة تدريجية لبناء صندوق طوارئ يغطي النفقات الأساسية لفترة محددة."
promptTextAr: |
  أريد إنشاء صندوق طوارئ لتغطية النفقات غير المتوقعة. بناءً على نفقاتي الشهرية وقدرتي على الادخار، ساعدني في تحديد المبلغ الذي يجب أن أدخره، وضع هدفًا واقعيًا، واقترح طرقًا للمساهمة فيه باستمرار.
  
  للحصول على أفضل خطة، يرجى تقديم:
  •	[نفقاتك الشهرية الأساسية]
  •	[مدخراتك الحالية]
  •	[قدرتك الشهرية على الادخار]
  •	[مدة التغطية المطلوبة (مثلاً، 3 أشهر، 6 أشهر)]
instructionAr: "املأ المعلومات بين الأقواس بتفاصيلك المالية الفعلية للحصول على خطة صندوق طوارئ مخصصة."

# Metadata
isPro: false
initialCopyCount: 90
copyCount: 130
version: 1

# Relations
categories:
  category: "Business & Marketing"
  subcategory: "Business Plans"
tools: 
  - ChatGPT
  - Claude
  - Gemini
  - Notion AI
  - Bing AI
keywords:
  - Emergency Fund
  - Financial Security
  - Savings Plan
  - Money Management
```

### 4. Smart Savings Goals Planner
```yaml
# English Content
titleEn: "Smart Savings Goals Planner"
descriptionEn: "Develop a structured plan to save for specific financial goals such as vacations, buying a home, or retirement."
promptTextEn: |
  Help me create a savings plan for my financial goals. Based on my goal amount, timeline, and current savings, suggest a structured savings strategy, including how much to save monthly and the best savings methods (e.g., high-yield accounts, investments, etc.).
  
  To generate the best plan, provide:
  •	[Your savings goal (e.g., home, car, wedding)]
  •	[Target amount]
  •	[Desired timeframe]
  •	[Current savings]
instructionEn: "Fill in the bracketed information with your actual financial details to get a personalized savings plan."

# Arabic Content
titleAr: "مخطط أهداف الادخار الذكية"
descriptionAr: "تطوير خطة منظمة للادخار لتحقيق أهداف مالية محددة مثل العطلات، شراء منزل، أو التقاعد."
promptTextAr: |
  ساعدني في إنشاء خطة ادخار لأهدافي المالية. بناءً على المبلغ المستهدف، الجدول الزمني، والمدخرات الحالية، اقترح استراتيجية ادخار منظمة تشمل المبلغ الشهري المطلوب والطرق الأفضل للادخار (مثل حسابات العائد المرتفع، الاستثمارات، إلخ.).
  
  للحصول على أفضل خطة، يرجى تقديم:
  •	[هدف الادخار الخاص بك (مثلاً، منزل، سيارة، زفاف)]
  •	[المبلغ المستهدف]
  •	[الإطار الزمني المطلوب]
  •	[مدخراتك الحالية]
instructionAr: "املأ المعلومات بين الأقواس بتفاصيلك المالية الفعلية للحصول على خطة ادخار مخصصة."

# Metadata
isPro: false
initialCopyCount: 70
copyCount: 110
version: 1

# Relations
categories:
  category: "Business & Marketing"
  subcategory: "Business Plans"
tools: 
  - ChatGPT
  - Claude
  - Gemini
  - Notion AI
  - Bing AI
keywords:
  - Savings Goals
  - Wealth Building
  - Smart Budgeting
  - Financial Growth
```

### 5. Retirement Planning Guide
```yaml
# English Content
titleEn: "Retirement Planning Guide"
descriptionEn: "Design a detailed retirement savings plan to ensure financial stability in later years."
promptTextEn: |
  Help me plan my retirement savings based on my current income, desired retirement age, and expected expenses. Suggest the best retirement accounts, investment strategies, and the amount I should save monthly to reach my goal.
  
  To generate the best plan, provide:
  •	[Your current age]
  •	[Your retirement age goal]
  •	[Expected monthly expenses in retirement]
  •	[Current retirement savings]
instructionEn: "Fill in the bracketed information with your actual financial details to get a personalized retirement plan."

# Arabic Content
titleAr: "دليل تخطيط التقاعد"
descriptionAr: "تصميم خطة ادخار تفصيلية للتقاعد لضمان الاستقرار المالي في المستقبل."
promptTextAr: |
  ساعدني في تخطيط مدخرات التقاعد بناءً على دخلي الحالي، والعمر الذي أريد التقاعد فيه، والنفقات المتوقعة. اقترح أفضل حسابات التقاعد، استراتيجيات الاستثمار، والمبلغ الشهري المطلوب للوصول إلى هدفي.
  
  للحصول على أفضل خطة، يرجى تقديم:
  •	[عمرك الحالي]
  •	[العمر الذي ترغب في التقاعد فيه]
  •	[النفقات الشهرية المتوقعة خلال التقاعد]
  •	[مدخراتك الحالية للتقاعد]
instructionAr: "املأ المعلومات بين الأقواس بتفاصيلك المالية الفعلية للحصول على خطة تقاعد مخصصة."

# Metadata
isPro: false
initialCopyCount: 60
copyCount: 100
version: 1

# Relations
categories:
  category: "Business & Marketing"
  subcategory: "Business Plans"
tools: 
  - ChatGPT
  - Claude
  - Gemini
  - Notion AI
  - Bing AI
keywords:
  - Retirement Planning
  - Financial Freedom
  - Investment Strategies
  - Long-Term Savings
```

### 6. Monthly Expense Tracker & Analysis
```yaml
# English Content
titleEn: "Monthly Expense Tracker & Analysis"
descriptionEn: "Track and analyze monthly expenses to identify spending patterns and improve financial management."
promptTextEn: |
  Help me create a monthly expense tracker that categorizes my spending and provides insights on where I can cut costs. Based on my income and expense details, generate a report that highlights unnecessary spending and suggests strategies to save more.
  
  To generate the best tracker, provide:
  •	[Your monthly income]
  •	[Your major expense categories]
  •	[Your biggest spending concerns]
  •	[Any specific savings goals you have]
instructionEn: "Fill in the bracketed information with your actual financial details to get a personalized expense tracker."

# Arabic Content
titleAr: "تعقب وتحليل النفقات الشهرية"
descriptionAr: "تتبع وتحليل النفقات الشهرية لتحديد أنماط الإنفاق وتحسين الإدارة المالية."
promptTextAr: |
  ساعدني في إنشاء متعقب نفقات شهرية يصنف إنفاقي ويوفر رؤى حول كيفية تقليل التكاليف. بناءً على دخلي وتفاصيل نفقاتي، قم بإنشاء تقرير يسلط الضوء على النفقات غير الضرورية ويقترح استراتيجيات لتوفير المزيد من المال.
  
  لإنشاء المتعقب الأمثل، يرجى تقديم:
  •	[دخلك الشهري]
  •	[فئات النفقات الرئيسية]
  •	[أكبر المخاوف بشأن الإنفاق]
  •	[أي أهداف ادخار محددة لديك]
instructionAr: "املأ المعلومات بين الأقواس بتفاصيلك المالية الفعلية للحصول على متعقب نفقات مخصص."

# Metadata
isPro: false
initialCopyCount: 50
copyCount: 90
version: 1

# Relations
categories:
  category: "Business & Marketing"
  subcategory: "Business Plans"
tools: 
  - ChatGPT
  - Claude
  - Gemini
  - Notion AI
  - Bing AI
keywords:
  - Expense Tracking
  - Budgeting
  - Financial Planning
  - Money Management
```

### 7. Credit Score Improvement Plan
```yaml
# English Content
titleEn: "Credit Score Improvement Plan"
descriptionEn: "Create a strategy to improve and maintain a high credit score for better financial opportunities."
promptTextEn: |
  Help me develop a step-by-step plan to improve my credit score. Based on my current credit history and debt situation, suggest the best strategies to increase my score, reduce debt, and maintain good financial health.
  
  To generate the best plan, provide:
  •	[Your current credit score (if known)]
  •	[Any outstanding debts or loans]
  •	[Your payment history: on-time, late, or missed payments]
  •	[Any recent credit applications]
instructionEn: "Fill in the bracketed information with your actual credit details to get a personalized credit score improvement plan."

# Arabic Content
titleAr: "خطة تحسين درجة الائتمان"
descriptionAr: "إنشاء استراتيجية لتحسين والحفاظ على درجة ائتمانية عالية للحصول على فرص مالية أفضل."
promptTextAr: |
  ساعدني في تطوير خطة خطوة بخطوة لتحسين درجة الائتمان الخاصة بي. بناءً على تاريخي الائتماني الحالي ووضع الديون، اقترح أفضل الاستراتيجيات لزيادة درجتي، وتقليل الديون، والحفاظ على صحة مالية جيدة.
  
  للحصول على أفضل خطة، يرجى تقديم:
  •	[درجة الائتمان الحالية (إن وجدت)]
  •	[أي ديون أو قروض مستحقة]
  •	[تاريخ الدفع الخاص بك: منتظم، متأخر، أو مدفوعات فائتة]
  •	[أي طلبات ائتمانية حديثة]
instructionAr: "املأ المعلومات بين الأقواس بتفاصيلك الائتمانية الفعلية للحصول على خطة تحسين درجة ائتمان مخصصة."

# Metadata
isPro: false
initialCopyCount: 40
copyCount: 80
version: 1

# Relations
categories:
  category: "Business & Marketing"
  subcategory: "Business Plans"
tools: 
  - ChatGPT
  - Claude
  - Gemini
  - Notion AI
  - Bing AI
keywords:
  - Credit Score
  - Financial Growth
  - Debt Management
  - Credit Health
```

### 8. Financial Goals Roadmap
```yaml
# English Content
titleEn: "Financial Goals Roadmap"
descriptionEn: "Develop a step-by-step roadmap to achieve short-term and long-term financial goals."
promptTextEn: |
  Help me create a clear financial goals roadmap that includes both short-term and long-term objectives. Based on my income, expenses, and savings, provide actionable steps to achieve my goals efficiently.
  
  To generate the best roadmap, provide:
  •	[Your current financial situation]
  •	[Your top financial goals]
  •	[Your estimated timeline for each goal]
  •	[Your monthly savings capacity]
instructionEn: "Fill in the bracketed information with your actual financial details to get a personalized financial goals roadmap."

# Arabic Content
titleAr: "خارطة طريق الأهداف المالية"
descriptionAr: "تطوير خارطة طريق مفصلة لتحقيق الأهداف المالية قصيرة وطويلة الأجل."
promptTextAr: |
  ساعدني في إنشاء خارطة طريق واضحة للأهداف المالية تتضمن الأهداف قصيرة وطويلة الأجل. بناءً على دخلي ونفقاتي ومدخراتي، قدم خطوات عملية لتحقيق أهدافي بكفاءة.
  
  للحصول على أفضل خارطة طريق، يرجى تقديم:
  •	[وضعك المالي الحالي]
  •	[أهم أهدافك المالية]
  •	[الجدول الزمني المتوقع لكل هدف]
  •	[قدرتك الشهرية على الادخار]
instructionAr: "املأ المعلومات بين الأقواس بتفاصيلك المالية الفعلية للحصول على خارطة طريق أهداف مالية مخصصة."

# Metadata
isPro: false
initialCopyCount: 30
copyCount: 70
version: 1

# Relations
categories:
  category: "Business & Marketing"
  subcategory: "Business Plans"
tools: 
  - ChatGPT
  - Claude
  - Gemini
  - Notion AI
  - Bing AI
keywords:
  - Financial Goals
  - Wealth Building
  - Money Management
  - Smart Investing
```

### 9. Side Income Planning & Optimization
```yaml
# English Content
titleEn: "Side Income Planning & Optimization"
descriptionEn: "Identify and optimize side income opportunities to boost financial stability."
promptTextEn: |
  Help me explore and plan side income opportunities based on my skills and available time. Suggest profitable ideas, estimate potential earnings, and recommend how I can manage and optimize multiple income streams effectively.
  
  To generate the best plan, provide:
  •	[Your skills and expertise]
  •	[Time available per week for a side hustle]
  •	[Any initial investment or budget available]
  •	[Preferred industry or type of work]
instructionEn: "Fill in the bracketed information with your actual skills and availability to get a personalized side income plan."

# Arabic Content
titleAr: "تخطيط وتحسين الدخل الجانبي"
descriptionAr: "تحديد وتحسين فرص الدخل الجانبي لتعزيز الاستقرار المالي."
promptTextAr: |
  ساعدني في استكشاف وتخطيط فرص الدخل الجانبي بناءً على مهاراتي ووقتي المتاح. اقترح أفكارًا مربحة، وقدّر الأرباح المحتملة، وقدم نصائح حول كيفية إدارة وتحسين مصادر الدخل المتعددة بفعالية.
  
  للحصول على أفضل خطة، يرجى تقديم:
  •	[مهاراتك وخبراتك]
  •	[الوقت المتاح أسبوعيًا للعمل الجانبي]
  •	[أي استثمار مبدئي أو ميزانية متاحة]
  •	[المجال أو نوع العمل المفضل لديك]
instructionAr: "املأ المعلومات بين الأقواس بمهاراتك ووقتك المتاح للحصول على خطة دخل جانبي مخصصة."

# Metadata
isPro: false
initialCopyCount: 20
copyCount: 60
version: 1

# Relations
categories:
  category: "Business & Marketing"
  subcategory: "Business Plans"
tools: 
  - ChatGPT
  - Claude
  - Gemini
  - Notion AI
  - Bing AI
keywords:
  - Side Income
  - Passive Income
  - Financial Growth
  - Extra Earnings
```

### 10. Smart Spending Guide
```yaml
# English Content
titleEn: "Smart Spending Guide"
descriptionEn: "Learn effective spending habits and smart financial decisions to maximize value from your money."
promptTextEn: |
  Help me develop smart spending habits by identifying essential vs. non-essential purchases, finding cost-saving alternatives, and making better financial decisions. Provide personalized tips to cut unnecessary expenses and optimize my budget.
  
  To generate the best guide, provide:
  •	[Your current monthly expenses]
  •	[Categories where you tend to overspend]
  •	[Your financial priorities and savings goals]
  •	[Any specific areas where you need spending advice]
instructionEn: "Fill in the bracketed information with your actual financial details to get a personalized smart spending guide."

# Arabic Content
titleAr: "دليل الإنفاق الذكي"
descriptionAr: "تعلم عادات الإنفاق الفعالة واتخاذ قرارات مالية ذكية لتعظيم قيمة أموالك."
promptTextAr: |
  ساعدني في تطوير عادات إنفاق ذكية من خلال التمييز بين المشتريات الضرورية وغير الضرورية، والعثور على بدائل أقل تكلفة، واتخاذ قرارات مالية أفضل. قدم لي نصائح مخصصة لتقليل النفقات غير الضرورية وتحسين ميزانيتي.
  
  للحصول على أفضل دليل، يرجى تقديم:
  •	[نفقاتك الشهرية الحالية]
  •	[الفئات التي تنفق فيها أكثر من اللازم]
  •	[أولوياتك المالية وأهداف الادخار]
  •	[أي مجالات محددة تحتاج فيها نصائح حول الإنفاق]
instructionAr: "املأ المعلومات بين الأقواس بتفاصيلك المالية الفعلية للحصول على دليل إنفاق ذكي مخصص."

# Metadata
isPro: false
initialCopyCount: 10
copyCount: 50
version: 1

# Relations
categories:
  category: "Business & Marketing"
  subcategory: "Business Plans"
tools: 
  - ChatGPT
  - Claude
  - Gemini
  - Notion AI
  - Bing AI
keywords:
  - Smart Spending
  - Budget Optimization
  - Financial Discipline
  - Money-Saving Tips
