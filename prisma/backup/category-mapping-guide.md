
    # Category Migration Guide
    
    This guide will help you reassign prompts to the new category structure.
    
    ## Steps to Reassign Categories:
    
    1. For each prompt in the backup file, find its old category and subcategory
    2. Use the mapping tables below to find the corresponding new category and subcategory
    3. Update the prompt's category associations in the database
    
    ## Category Mapping
    
    Old Category Name -> New Category Name
    
    - "Content Creation" -> "Writing"
- "Business & Marketing" -> "Business"
- "Programming & Development" -> "Development"
- "Visual Arts" -> "Design"
- "Education & Learning" -> "Education"
- "Data & Analytics" -> "Business"
- "Personal Development" -> "Career"
- "Research & Analysis" -> "Education"
- "Legal & Compliance" -> "Legal"
- "Entertainment & Media" -> "Entertainment"
    
    ## Subcategory Mapping
    
    Old Subcategory Name -> [New Category Name, New Subcategory Name]
    
    - "Blog Writing" -> ["Writing", "Blog & Articles"]
- "Social Media Posts" -> ["Social Media", "Captions"]
- "Email Writing" -> ["Communication", "Work Emails"]
- "Product Descriptions" -> ["Marketing", "Content Creation"]
- "Academic Writing" -> ["Education", "Learning Content"]
- "Technical Writing" -> ["Development", "Documentation"]
- "Creative Writing" -> ["Writing", "Creative Writing"]
- "Script Writing" -> ["Writing", "Scripts"]
- "Marketing Strategy" -> ["Marketing", "Content Creation"]
- "Sales Copy" -> ["Marketing", "Content Creation"]
- "Brand Development" -> ["Design", "Branding"]
- "Market Research" -> ["Business", "Market Analysis"]
- "Business Plans" -> ["Business", "Business Plans"]
- "Customer Service" -> ["Customer Support", "Response Templates"]
- "Advertising" -> ["Marketing", "Ad Campaigns"]
- "Code Generation" -> ["Development", "Code & Debug"]
- "Code Review" -> ["Development", "Code & Debug"]
- "Bug Fixing" -> ["Development", "Troubleshooting"]
- "Documentation" -> ["Development", "Documentation"]
- "Architecture Design" -> ["Development", "API Integration"]
- "Testing" -> ["Development", "Troubleshooting"]
- "DevOps" -> ["Development", "Troubleshooting"]
- "Image Generation" -> ["Design", "Digital Art"]
- "Art Direction" -> ["Design", "Digital Art"]
- "Character Design" -> ["Entertainment", "Characters"]
- "Environment Design" -> ["Design", "Digital Art"]
- "Logo Design" -> ["Design", "Logo Design"]
- "UI/UX Design" -> ["Design", "UI/UX"]
- "Animation" -> ["Design", "Motion Graphics"]
- "Lesson Planning" -> ["Education", "Lesson Plans"]
- "Study Guides" -> ["Education", "Learning Content"]
- "Quiz Generation" -> ["Education", "Quizzes & Exams"]
- "Research Assistance" -> ["Education", "Learning Content"]
- "Language Learning" -> ["Education", "Skill Building"]
- "Tutoring" -> ["Education", "Explanations"]
- "Data Analysis" -> ["Business", "Market Analysis"]
- "Data Visualization" -> ["Business", "Market Analysis"]
- "Statistical Analysis" -> ["Business", "Market Analysis"]
- "Machine Learning" -> ["Development", "Algorithms"]
- "Business Intelligence" -> ["Business", "Strategy"]
- "Reporting" -> ["Business", "Financial Reports"]
- "Goal Setting" -> ["Productivity", "Goal Setting"]
- "Career Development" -> ["Career", "Career Advice"]
- "Life Coaching" -> ["Career", "Personal Brand"]
- "Productivity" -> ["Productivity", "Time Management"]
- "Mental Health" -> ["Career", "Personal Brand"]
- "Time Management" -> ["Productivity", "Time Management"]
- "Academic Research" -> ["Education", "Learning Content"]
- "Market Analysis" -> ["Business", "Market Analysis"]
- "Competitive Analysis" -> ["Business", "Market Analysis"]
- "Literature Review" -> ["Education", "Learning Content"]
- "Trend Analysis" -> ["Business", "Market Analysis"]
- "Scientific Writing" -> ["Education", "Learning Content"]
- "Legal Writing" -> ["Legal", "Legal Documents"]
- "Contract Review" -> ["Legal", "Contracts"]
- "Policy Generation" -> ["Legal", "Compliance"]
- "Compliance Checks" -> ["Legal", "Compliance"]
- "Terms & Conditions" -> ["Legal", "Legal Documents"]
- "Privacy Policies" -> ["Legal", "Legal Documents"]
- "Storytelling" -> ["Entertainment", "Stories & Scripts"]
- "Game Design" -> ["Entertainment", "Game Design"]
- "Video Scripts" -> ["Entertainment", "Stories & Scripts"]
- "Podcast Scripts" -> ["Entertainment", "Stories & Scripts"]
- "Music Generation" -> ["Entertainment", "Media Concepts"]
- "Entertainment Writing" -> ["Entertainment", "Stories & Scripts"]
    
    ## For Prompts Without Mappings
    
    If a prompt's old category or subcategory doesn't have a mapping, use your best judgment to assign it to the most appropriate new category and subcategory.
    