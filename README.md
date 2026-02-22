# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Appwrite setup (Saved movies)

To use the save/favourites feature:

1. **Enable Anonymous Auth**: In Appwrite Console → Auth → Settings, enable **Anonymous sign-in**. The app creates an anonymous session on startup so users can save movies without signing up.

2. Create a **favourites** collection in your Appwrite database with these attributes:

| Attribute     | Type   | Required |
|--------------|--------|----------|
| `movie_id`   | integer| yes      |
| `title`      | string | yes      |
| `poster_path`| string | yes      |
| `vote_average` | float | yes    |
| `release_date` | string | yes   |

3. In [Appwrite Console](https://cloud.appwrite.io), open your project → Databases → select your database.
4. Create a collection with ID `favourites`.
5. Add the attributes above.
6. Set **Permissions**: For the collection, allow create/read/delete for users. Since we use anonymous sessions, use "Users" permission with role `users`.
7. Add to `.env`:
   ```
   EXPO_PUBLIC_APPWRITE_FAVOURITES_COLLECTION_ID=favourites
   ```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
