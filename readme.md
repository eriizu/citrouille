# Bot Citrouille

# Instructions de lancement

## Prérequis

| Type de dépendance        | Paquet ou programme                |
| ------------------------- | ---------------------------------- |
| Base de donnée            | *Aucune nécessaire pour l'instant* |
| Environnement d'exécution | NodeJS                             |
| Gestionnaire de paquet    | yarn                               |

Vous allez aussi avoir besoin d'un jeton de bot discord que vous pouvez créer [ici](https://discord.com/developers/applications).

Il s'agit de créer une application, et ensuite de créer un bot dans la sous-section éponyme.

## Où mettre le jeton discord ?

Il faut que vous le mettiez dans la variable d'environement `CITROUILLE_DISCORD_TOKEN`.

Pour ce faire, dans un shell bash ou zsh, faites:
```sh
export CITROUILLE_DISCORD_TOKEN=votreTokenTelQuel
```

Vous pouvez aussi le mettre dans un fichier au format `clé=valeur` (sans espaces) et le faire charger avant l'éxécution par la commande suivante :

```sh
export $(cat non_de_votre_fichier | xargs)
```

## Ajouter un bot à un serveur

Si le bot que vous souhaitez utiliser pour tester n'est pas déjà sur un serveur, il va falloir l'y ajouter avec un lien d'OAuth Discord.

Discord ne vous génère pas de lien lui-même, alors vous devrez remplacer le `client_id` par celui que vous voyez sur le tableau de bord de votre bot de l'interface developeurs de Discord.

Archétype du lien:
```
https://discordapp.com/api/oauth2/authorize?client_id=708330125963296768&scope=bot&permissions=1
```

## Lancement

```sh
# Installation des dépendences
yarn

# Compilation
yarn build

# Lancement
yarn run
```