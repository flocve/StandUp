# 🎨 Système de Thèmes

L'application dispose de trois thèmes uniques que vous pouvez basculer via le sélecteur de thème en haut à droite de l'écran.

## 🌙 Dark Mode
- **Description**: Le mode sombre élégant par défaut
- **Couleurs**: Tons sombres avec des accents bleus et violets
- **Idéal pour**: Une utilisation prolongée et un confort visuel
- **Caractéristiques**: 
  - Arrière-plan sombre avec effets de verre
  - Texte clair et contrasté
  - Effets glassmorphism subtils

## ☀️ White Mode  
- **Description**: Mode clair et lumineux
- **Couleurs**: Fond blanc avec des accents colorés
- **Idéal pour**: Une meilleure lisibilité en environnement lumineux
- **Caractéristiques**:
  - Arrière-plan clair et propre
  - Texte sombre pour une lisibilité optimale
  - Effets d'ombre subtils

## 🦄 Unicorn Mode
- **Description**: Mode magique et coloré avec des effets visuels spéciaux
- **Couleurs**: Dégradés multicolores animés
- **Idéal pour**: Ajouter de la magie et de l'amusement à l'expérience
- **Caractéristiques**:
  - Arrière-plan animé avec dégradés arc-en-ciel
  - Particules magiques flottantes
  - Effets de brillance et d'animation sur tous les éléments
  - Textes avec effets de dégradé animé
  - Boutons avec animations colorées

## 🔧 Utilisation

### Via l'Interface
- Cliquez sur le sélecteur de thème (🎨) en haut à droite
- Choisissez votre thème préféré parmi les trois options
- Le thème est automatiquement sauvegardé dans votre navigateur

### Via le Code
```tsx
import { useTheme } from './hooks/useTheme';

function MonComposant() {
  const { theme, setTheme, themes } = useTheme();
  
  return (
    <div>
      <p>Thème actuel: {theme}</p>
      <button onClick={() => setTheme('unicorn')}>
        Mode Licorne! 🦄
      </button>
    </div>
  );
}
```

## 🎨 Personnalisation

Les thèmes utilisent des variables CSS personnalisées qui peuvent être modifiées dans `src/index.css`:

```css
/* Exemple pour créer un nouveau thème */
html.theme-custom {
  --background-primary: #your-color;
  --text-primary: #your-color;
  --accent-primary: #your-color;
  /* ... autres variables */
}
```

## ✨ Fonctionnalités Techniques

- **Persistance**: Le thème choisi est sauvegardé automatiquement
- **Performance**: Changement de thème instantané via CSS variables
- **Responsive**: Optimisé pour tous les écrans
- **Accessibilité**: Contrastes respectés pour une bonne lisibilité
- **Animations**: Transitions fluides entre les thèmes
- **🌊 Liquid Glass**: Effets de verre liquide adaptatifs par thème

## 🌊 Système Liquid Glass

L'application intègre maintenant un **système d'effets liquid glass** qui s'adapte automatiquement à chaque thème :

### 🌙 Dark Mode + Liquid Glass
- Flou avancé avec saturation 180%
- Glow bleu-violet subtil (rgba(79, 124, 255, 0.05))
- Effets de profondeur maximaux
- Brillances futuristes

### ☀️ White Mode + Liquid Glass  
- Flou doux avec saturation 120%
- Ombres réalistes et légères
- Contraste optimisé pour la lisibilité
- Effets hover subtils

### 🦄 Unicorn Mode + Liquid Glass
- Flou magique avec saturation 200%
- Animations colorées automatiques (`liquidGlowPulse`)
- Changements de bordures animés (`liquidColorShift`)
- Effets de brillance magiques intensifiés

### 🎯 Classes Disponibles
```css
.liquid-glass           /* Effet standard adaptatif */
.liquid-glass-subtle    /* Effet léger pour arrière-plans */
.liquid-glass-strong    /* Effet intense pour focus */
.apply-liquid-glass     /* Force l'effet (avec !important) */
```

Consultez le fichier `LIQUID_GLASS_GUIDE.md` pour une documentation complète du système. 