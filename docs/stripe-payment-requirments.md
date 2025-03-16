### Stripe payment

User flow:
1. in our project, users can register and login
2. becuase we have two type of prompts , one is basic which labeled in the database is_Pro: false that means this prompt is free for free users, Pro prompts which are labeled in the database / prompts / is_pro: true these pro prompts will be shown blurred for free users and will appear for subscribers only 
3. If the users wants to subscribe, they need to go to subscription page and choose the plan they want to subscribe to
the plans we have created in our stripe sandbox (text) are monthly, quarterly and annual:
monthly : #9.99 Stripe PriceId: price_1R31Eu5NT1VbYccPKm9UFqgY
quartly: #24.99 Stripe PriceId: price_1R31Eu5NT1VbYccPSxde1uju
annual: #69.99 Stripe PriceId: price_1R31Eu5NT1VbYccPNtp8e9nO

My stripe sandbox publishable key is : pk_test_51R315V5NT1VbYccPiK99kFnwNV3VPoi6agUKCbLp7y9zYQ2QRENDZUNMoESaKPE2KzbKB18tCVNZws155xmeLImT00z9bgnpVL

my secret key is: sk_test_51R315V5NT1VbYccPIYTaa4vkpanWcfv1SHC2zsMb6h9yED3zKKto0F86oLGSR31aU2c0c0eU5gyvwmrfAz3vIq1900lTzJoDbW

if you need anything else from my strip dashboard, feel free to ask and provide step by step to guide me how to get whatever you need for you 

4. in our subscription page, the toggle button that switches between monthly, quartly and annual is not functional and not good in terms of UX UI, i think we need to show the three packages cards or i don't know what you call them in one row in the subscription page and remove the toggle button that switch between monthly, quartly and annual because we no longer need it

5. after you improve the UX UI of the subscription page, and it's ready to be used let's continue with imagining the flow , the user will choose the plan then will be redirected to strip payment page, in our case we will use a test card because we are working on sandbox test which is card 4242

After the test payment successful, we should redirect the user to the page that we have developed which is already exists and i think it's called successful page the one that has a popup with confetti animation (this page already exists and no need to do any changes to it), in the same time we will need to update the database / subscription table and add that user ID and whatever we need to implement to ensure that the site reads that this user is pro
what i mean is that how the website will read that this user is pro and show all pro prompts for him/her 

Also it's very important to search in our codebase as i think we have a Pro badge that should be shown in the navbar besides the profile picture 

Also in the profile or users account pages , we have a page called subscription 
note that this page is different than the subscription page we have in the homepage where we show the packages cards and upgrade to pro buttons, this page is inside my account 

This subscription page inside user's my account page , should have billing history, account status / badge of  pro, expired, free, also the rest of the functions we have should be checked and functional and integrated with whatever you think is needed to be integrated with

it's also important to include the cancel subscription button and make it functional and double check with the flow as well of this and what will happen to the account 

usually cancelling the subscription doesn't mean you take  the Pro features from the account, it just means that the auto renewal will be paused correct?

## QUESTIONS that need codebase examination and brainstorming and professional recommendations / clarifying:
1. What will happen if the user already subscribed and has active plan and then try to subscribe again ?
2. usually cancelling the subscription doesn't mean you take  the Pro features from the account, it just means that the auto renewal will be paused correct?
3. also what would happen if the user is working on the website, browsing prompts in the homepage and copying them , and while he's working his / her subscription ended , how the website will knows and lock the pro prompts immediately? and what pop-up or messages will show to the user 
4. if the user want to upgrade their plan, whether their status is expired or active, what will happen and what is the best professional approach or flow for this 

## IMPORTANT POINTS TO CONSIDER AND STRICTLY FOLLOW:
1. Please note that each implementation we need to do here need to be double checked and NEVER EVER create something that already have been created before to avoid duplication in codes or files
2. always try to understand our file structure so you avoid creating something in the wrong path
