# Application context:
This repository is for a web app created to manage shared lists bettwen users called shelf. 
Shared Shelf is a Vercel-hosted web app for shared planning. Users authenticate, create or join private shelves, and manage shared calendar, tasks, locations, trips, recipes, and watchlist (movies, TV shows, and books).

When a user creates a shelf, after creation, he can add other users to it, meaning a shelf can have multiple users.

The application is deployed on Vercel free plan. Using Free Neon Postgresql database. No more than 12 Serverless Functions can be added to a Deployment on the free plan.

# User Experience

1. Homepage
Initial screen when users join https://shared-shelf.vercel.app/. Users can either login or register.
Login can be done with either username or email and password.
Users can click Remember me box and if they forget password can request password reset.
In register users need to provide name, username (needs to be unique) and email (needs to be confirmed to login successfully).

2. Shelf Selection
Page that opens after sucessfully logging in. Users can either join their shelves, create new ones or join shelves that are already created by other people. Users can click manage to remove shelves from their account.
Here in this page users can click profile to see their main information (and are able to edit it) and also are able to click loggout.

When users create a shelf they can define which shared things they want. In this case there is a checkbox that lists each item and they are able to personalize what they need, and later they can go to settings and change this, meaning they can add or remove items. Items are "Calendar", "Tasks", "Locations", "Trips", "Recipes", "Watchlist" (Movies, TV Shows and Books). 

3. Shelf
A shelf is like a private group, each shelf has it own unique id. A user can join a shelf meaning 1 shelf can have multiple users which will all access to the same information of the corresponding unique shelf.

3.1. Shelf Header
Header is composed of:
Aligned to the left
- Shelf name
- Shared Items - Inside this box there are multiple boxes/tabs, one box/tab for each item. When you are in that tab that tab stays with the selected color.

Aligned to the right
- (settings icon) Shelf Settings
- (person icon) Profile
- (arrow icon) Back