Notre blog comporte les fonctionalités suivantes:
- Login/Register
	- Lors d'une inscription, on log le user et on le redirige vers la page d'accueil
	- Lors d'un login, on génère un token qui permettra d'effectuer certaines requetes
- Blogging
	- Les utilisateurs (non loggés/loggés) peuvent voir les articles crées, les partager si ils sont connectés, et voir les commentaires si ils sont connectés
	- Ils peuvent aussi les ajouter en favoris si ils sont connectés
- Favoris
	- Le système de likes, amenant la compétition à été revisité pour en faire des favoris, que l'utilisateur pourra retrouver depuis la barre de navigation
- About
	- Une page à propos à été réalisée pour expliquer le role de chaque membre au sein du projet
- Homepage
	- Une section qui définit les capabilités du blog à été faite
- Enfin, le bouton New Article permet d'écrire un article, (uniquement visible lors d'une connection), à été implémenté avec cela, un algorithme (basé sur TF-IDF), en somme NLP afin de déduire les catégories d'un article en fonction de son contenu, pour garder ce document simple, nous n'irons pas plus dans les détails
- Le lien du repo github y est aussi présent
- il est possible de rechercher des articles grâce a la barre de recherche, implémentée avec du fuzzy
- 
## Pour installer le projet

`git clone https://github.com/Darleanow/ABlog`

`cd frontend && npm i`
`cd backend && npm i`

Dans deux terminaux séparés:
`npm run dev` ==> même commande pour les 2

En cas d'erreurs, supprimer `node_modules` et faire un `npm ci`

Il faudra aussi ajouter les variables d'environnement suivantes à un .env a la racine du dossier `backend`:

```dotenv
NODE_ENV=development

PORT=3001

SUPABASE_URL=https://czqwnyadbszsmhxoirpl.supabase.co

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6cXdueWFkYnN6c21oeG9pcnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTY5NjMsImV4cCI6MjA1MjMzMjk2M30.OvupeclCtgK1ZShzTABoJcAIcDQCIOPThVQJW0s5sNo

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6cXdueWFkYnN6c21oeG9pcnBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjc1Njk2MywiZXhwIjoyMDUyMzMyOTYzfQ.7F-0DfeW5ug3_mTVA945QpcI7d4CD0c_38K6N33c2aM
```

Merci de garder ce .env confidentiel.

Vous pourrez accéder à la page d'accueil du blog sur `http://localhost:3000/`

Vous pourrez ensuite créer un compte et commencer a poster des articles !

Nous n'avons pas de pipeline CI/CD, en revanche, un déploiement automatique sur vercel à été mis en place, à moitié fonctionnel à cause des contraintes de temps

## Clean Code

Pour respecter les principes de clean code, nous nous sommes éforcés d'utiliser les concept SOLID dans notre architecture, de ce fait, le frontend, ainsi que le backend contiennent beacoup de fichiers.
L'accent n'a pas été porté aux commentaires bien qu'il y en ai lorsque nécessaire.

Nous avons respectés nos conventions établies, si bien dans git (branches, commit) que directement dans notre code.

Pour les variables, nous les avons généralement nommées ainsi: `aVariable`
Pour les noms de fichiers, dans le frontend: `a-file-example.ts|x`

La structure du code source nous a permit de ne pas nécessiter de documentation.

## Difficultés

Les parties difficiles ont été l'organisation et la gestion de projet.
De plus, s'efforcer de maintenir un code clair et SOLID nous a demandé la plus grande attention et de nombreux refactos dans le code, qui ont pu être parfois très longs.
