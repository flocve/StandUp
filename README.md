# 🎲 StandUp Picker

Une application simple et ludique pour fluidifier les stand-ups d'équipe !

---

## 🧪 Concept du projet

> **Ce projet est une expérimentation complète sur le développement par intelligence artificielle.**

L’objectif est de démontrer **ce qu’il est possible de réaliser à 100% via une IA**, sans intervention humaine.

- 📐 **Idée, conception, structure, code, design, README** : tout a été généré par **Claude 4 Sonnet**, via l’éditeur **Cursor**.
- 🎯 L'humain s’est contenté de formuler les intentions générales — l’IA a tout produit seule.

Ce projet est donc autant une application fonctionnelle qu'une **preuve de concept**.

---

## 🚀 Fonctionnalités

- **🎯 Sélection aléatoire d'un participant** pour intervenir durant le stand-up quotidien.
- **📅 Désignation hebdomadaire de l'animateur**, avec un système de pondération :
  - Moins tu as animé récemment, plus tu as de chances d’être choisi.
  - Une équité dynamique est maintenue au fil des semaines.

---

## ⚙️ Stack technique

- **Frontend** : [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styles** : Tailwind CSS 
- **Stockage** : LocalStorage

---

## 🛠️ Installation

```bash
git clone https://github.com/flocve/StandUp.git
cd StandUp
npm install
npm run dev