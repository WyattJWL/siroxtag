# Contenu de Wyattpédia. Un article = un dictionnaire.
# cat : "aime" (ce que j’aime) ou "veux" (ce que je veux faire)
RN = '<sup class="rn" tabindex="0" title="Source : moi.">[réf. nécessaire]</sup>'

ARTICLES = [
# ---------------- CE QUE J’AIME ----------------
dict(slug='code', cat='aime', title='Code', glyph='{ }', tone='sky',
 short='Ma passion. Mon métier en préparation. Ma raison de ne pas dormir.',
 box=[('Type', 'Passion principale'), ('Découvert', 'En 6e'), ('Temps passé', 'Tout'), ('Niveau', 'Dieu du code ' + RN), ('Effets secondaires', 'Sommeil : null')],
 lead='<b>Le code</b> est un ensemble d’instructions écrites pour qu’un ordinateur fasse quelque chose. Pour la plupart des gens, c’est un outil. Pour Wyatt, c’est un mode de vie.',
 sections=[
  ('Définition', '<p>Coder, c’est écrire des instructions dans un langage que l’ordinateur comprend : Python, JavaScript, et bien d’autres. L’ordinateur fait exactement ce qu’on lui dit. Le problème, c’est qu’il fait <em>exactement</em> ce qu’on lui dit.</p>'),
  ('Chez Wyatt', '<p>Tout a commencé en 6e, avec une tortue en Python qui dessinait un cœur. Depuis, il code des sites, des SaaS, des bots Discord et des jeux. Quand on lui demande ce qu’il fait en dehors du code, il répond : « du code ».</p>'),
  ('Cycle de vie typique', '<ol><li>Avoir une idée à 23 h.</li><li>« Juste cinq minutes. »</li><li>Il est 4 h du matin.</li><li>Ça marche.</li><li>Ça ne marche plus.</li><li>Recommencer.</li></ol>'),
 ],
 see=['python', 'javascript', 'sites-saas', 'developpeur'], refs=['Wyatt, à 3 h du matin, 2026.', 'Le clavier de Wyatt, témoin principal.']),

dict(slug='python', cat='aime', title='Python', glyph='Py', tone='sage',
 short='Mon premier langage. Une tortue, un cœur, et tout a commencé.',
 box=[('Type', 'Langage de programmation'), ('Créé par', 'Guido van Rossum'), ('Première version', '1991'), ('Rencontré', 'En 6e'), ('Premier programme', 'Un cœur pour maman')],
 lead='<b>Python</b> est un langage de programmation connu pour être lisible et simple à apprendre. C’est le premier langage de Wyatt, et sans doute le plus important de sa vie.',
 sections=[
  ('Définition', '<p>Python a été créé par Guido van Rossum et publié pour la première fois en 1991. On l’utilise partout : sites web, intelligence artificielle, science des données, automatisation. Il est souvent conseillé aux débutants, parce qu’il se lit presque comme de l’anglais.</p>'),
  ('Le module turtle', '<p>Python contient un petit module appelé <code>turtle</code>. Il fait avancer une « tortue » à l’écran, qui laisse un trait derrière elle. C’est parfait pour apprendre : on écrit une ligne, et on voit le dessin bouger.</p>'),
  ('Le premier code de Wyatt', '<p>En 6e, Wyatt programme une tortue qui dessine un cœur et écrit « Je t’aime maman ». Statut actuel : zéro bug signalé. C’est son seul code dans ce cas ' + RN + '.</p><pre class="snip"><code>import turtle\nt = turtle.Turtle()\n# ... un cœur ...\nt.write("Je t’aime maman")</code></pre>'),
 ],
 see=['code', 'javascript', 'filiere-generale'], refs=['Documentation officielle de Python.', 'Maman, première utilisatrice.']),

dict(slug='javascript', cat='aime', title='JavaScript', glyph='JS', tone='sand',
 short='Le langage du web. Et l’origine de ma manie des points-virgules.',
 box=[('Type', 'Langage de programmation'), ('Créé par', 'Brendan Eich'), ('Année', '1995'), ('Sert à', 'Faire bouger les sites'), ('Manie associée', 'Vérifier chaque « ; »')],
 lead='<b>JavaScript</b> est le langage qui rend les pages web interactives. Tous les navigateurs le comprennent. Ce site, par exemple, en est rempli.',
 sections=[
  ('Définition', '<p>JavaScript a été créé en 1995 par Brendan Eich, chez Netscape. Au départ, il servait à de petites animations. Aujourd’hui, il fait tourner des applications entières, côté navigateur comme côté serveur.</p>'),
  ('L’affaire du point-virgule', '<p>En JavaScript, le point-virgule à la fin d’une ligne est souvent facultatif. Le langage les ajoute tout seul quand il en manque. Wyatt, lui, ne lui fait pas confiance : il vérifie chaque « ; », un par un. Même ceux qui ne servent à rien.</p>'),
  ('Sur ce site', '<p>Toutes les animations de cette page, le terminal en bas à droite et les mots cachés sont écrits en JavaScript. Sans bibliothèque. À la main. Avec des points-virgules.</p>'),
 ],
 see=['code', 'sites-saas', 'bug'], refs=['Le terminal en bas à droite. Essaie <code>help</code>.']),

dict(slug='sites-saas', cat='aime', title='Sites web et SaaS', glyph='www', tone='lilac',
 short='Mon domaine préféré. Créer des choses que les gens utilisent vraiment.',
 box=[('Type', 'Domaine préféré'), ('SaaS', 'Logiciel en ligne, par abonnement'), ('Exemples', 'siroxtag.fr, cette page'), ('Plaisir', 'Maximum')],
 lead='<b>Un site web</b> est un ensemble de pages consultables sur Internet. <b>Un SaaS</b> (« Software as a Service ») est un logiciel qu’on utilise directement dans le navigateur, sans rien installer. C’est le domaine préféré de Wyatt.',
 sections=[
  ('Définition', '<p>Un site présente des informations. Un SaaS rend un service : gérer des factures, organiser une équipe, réserver un rendez-vous. Le client paie souvent un abonnement, et le logiciel est mis à jour en continu.</p>'),
  ('Pourquoi Wyatt adore', '<p>Parce qu’on part de rien et qu’on finit avec un outil que des gens utilisent pour de vrai. Il y a du design, du code, de la logique, et beaucoup de détails. Exactement ce qu’il aime.</p>'),
  ('Réalisations', '<ul><li><a href="/">siroxtag.fr</a>, le site de Siroxtag.</li><li>Le dossier <a href="/Linear/">Linear</a>, en motion design.</li><li>Cette page. Oui, tu es dedans.</li></ul>'),
 ],
 see=['code', 'javascript', 'developpeur', 'bug'], refs=['Le site que tu es en train de lire.']),

dict(slug='hacking-ethique', cat='aime', title='Hacking éthique', glyph='#', tone='rose',
 short='Trouver les failles d’un site avant les méchants. Avec la permission.',
 box=[('Type', 'Sécurité informatique'), ('Plateforme', 'YesWeHack'), ('Score', '2 failles en 2 jours'), ('Règle n° 1', 'Toujours avec l’accord du site'), ('Affiliation', 'Aucune')],
 lead='<b>Le hacking éthique</b> consiste à chercher les failles de sécurité d’un système, avec l’accord de son propriétaire, pour qu’elles soient corrigées avant d’être exploitées. Wyatt y participe en indépendant, sur la plateforme YesWeHack.',
 sections=[
  ('Définition', '<p>Une entreprise ouvre un « programme de bug bounty » : elle autorise des chercheurs à tester certains de ses sites, selon des règles précises. Ceux qui trouvent une faille la signalent en privé, et peuvent recevoir une récompense.</p>'),
  ('Ce que dit la loi', '<p>En France, accéder sans autorisation à un système informatique est un délit (article 323-1 du Code pénal). C’est pour ça que tout se fait dans le cadre d’un programme officiel, et uniquement sur ce qu’il autorise. Pas d’accord, pas de test. Jamais.</p>'),
  ('Palmarès', '<p>Deux failles trouvées en deux jours. Wyatt n’est ni employé ni partenaire de YesWeHack : il y participe en indépendant, comme n’importe quel chercheur inscrit.</p>'),
 ],
 see=['cyberpolicier', 'code', 'bug'], refs=['Code pénal, article 323-1.', 'YesWeHack est une marque de son propriétaire. Aucune affiliation.']),

dict(slug='bots-discord', cat='aime', title='Bots Discord', glyph='bot', tone='sage',
 short='Des robots pour serveurs RP. Dont un qui gère des impôts. Pardon.',
 box=[('Type', 'Programmes automatiques'), ('Plateforme', 'Discord'), ('Spécialité', 'Serveurs de jeu de rôle'), ('Fonction la plus détestée', 'Les impôts')],
 lead='<b>Un bot Discord</b> est un programme qui agit tout seul sur un serveur Discord : il répond aux commandes, donne des rôles, gère des candidatures. Wyatt en code pour des serveurs de jeu de rôle.',
 sections=[
  ('Définition', '<p>Un bot est un compte un peu spécial, piloté par du code au lieu d’un humain. On lui apprend à réagir : une commande, un bouton, un message. Il fait le travail répétitif, sans jamais se fatiguer.</p>'),
  ('Le fisc', '<p>Le chef-d’œuvre de Wyatt : un bot qui gère les impôts d’un serveur RP. Oui, il a inventé les impôts sur Discord. Les joueurs ne l’ont toujours pas remercié ' + RN + '.</p>'),
 ],
 see=['discord', 'gta-rp', 'code'], refs=['<a href="https://github.com/ezechielw13" target="_blank" rel="noopener noreferrer">GitHub de Wyatt</a>.']),

dict(slug='claude-maxxing', cat='aime', title='Claude Maxxing', glyph='✳', tone='sand',
 short='Utiliser une IA à fond pour coder plus vite. Arme secrète officielle.',
 box=[('Type', 'Technique de travail'), ('Outil', 'Claude, l’IA d’Anthropic'), ('Productivité', '×10 ' + RN), ('Affiliation', 'Aucune')],
 lead='<b>Le Claude Maxxing</b> désigne le fait d’utiliser Claude, l’assistant d’intelligence artificielle de la société Anthropic, au maximum, pour coder plus vite. Le mot vient de la mode des « -maxxing » sur Internet : pousser quelque chose à fond.',
 sections=[
  ('Définition', '<p>Claude est un assistant d’IA. On lui pose des questions, on lui demande d’écrire ou de corriger du code. Le « maxxing », c’est en faire son binôme de travail, tous les jours.</p>'),
  ('Règle d’or', '<p>L’IA propose, Wyatt vérifie. Un code qu’on ne comprend pas, c’est un bug qui attend son heure. Surtout s’il manque un point-virgule.</p>'),
  ('Mascotte', '<p>La petite bestiole orange en pixels de la page d’accueil est un dessin maison. Ce n’est pas la mascotte officielle, et Wyatt n’a aucun lien avec Anthropic.</p>'),
 ],
 see=['code', 'vs-code'], refs=['Claude est une marque d’Anthropic, PBC.']),

dict(slug='vs-code', cat='aime', title='VS Code', glyph='</>', tone='sky',
 short='Là où je vis. Mon éditeur de code, mon deuxième chez-moi.',
 box=[('Type', 'Éditeur de code'), ('Éditeur', 'Microsoft'), ('Sortie', '2015'), ('Prix', 'Gratuit'), ('Niveau de Wyatt', '112 %')],
 lead='<b>Visual Studio Code</b>, ou VS Code, est un éditeur de code gratuit créé par Microsoft. C’est l’endroit où Wyatt passe la plupart de son temps éveillé. Et une partie de son temps censé être endormi.',
 sections=[
  ('Définition', '<p>Un éditeur de code, c’est un traitement de texte pour développeurs. VS Code colore le code, repère les erreurs, complète les mots et s’enrichit avec des extensions.</p>'),
  ('Chez Wyatt', '<p>Thème sombre, des dizaines d’onglets ouverts, et un terminal toujours prêt. Classement personnel : niveau dieu.</p>'),
 ],
 see=['github', 'code', 'claude-maxxing'], refs=['Visual Studio Code est une marque de Microsoft Corporation.']),

dict(slug='github', cat='aime', title='GitHub', glyph='git', tone='lilac',
 short='Là où je range tout mon code. Enfin, presque tout.',
 box=[('Type', 'Plateforme de code'), ('Fondée', '2008'), ('Propriétaire', 'Microsoft (depuis 2018)'), ('Compte de Wyatt', 'ezechielw13')],
 lead='<b>GitHub</b> est une plateforme en ligne pour stocker du code, suivre ses versions et travailler à plusieurs. Ce site est d’ailleurs hébergé dessus, grâce à GitHub Pages.',
 sections=[
  ('Définition', '<p>GitHub repose sur Git, un outil qui garde l’historique de chaque modification. On peut revenir en arrière, comparer, fusionner. Bref : ne plus jamais perdre son travail.</p>'),
  ('Le piège', '<p>Modifier un fichier directement sur GitHub pendant que quelqu’un d’autre le modifie ailleurs. Résultat : un conflit, et un site qui casse. C’est arrivé. On n’en parle plus ' + RN + '.</p>'),
 ],
 see=['vs-code', 'code', 'sites-saas'], refs=['<a href="https://github.com/ezechielw13" target="_blank" rel="noopener noreferrer">github.com/ezechielw13</a>', 'GitHub est une marque de GitHub, Inc.']),

dict(slug='discord', cat='aime', title='Discord', glyph='#', tone='rose',
 short='Là où vivent mes bots. Et une bonne partie de ma vie sociale.',
 box=[('Type', 'Messagerie'), ('Lancement', '2015'), ('Usage de Wyatt', 'Serveurs RP et bots'), ('Niveau', 'Dieu (et modérateur de ses propres bots)')],
 lead='<b>Discord</b> est une application de discussion par texte, voix et vidéo, organisée en « serveurs ». Très utilisée par les joueurs, c’est aussi là que tournent les bots de Wyatt.',
 sections=[
  ('Définition', '<p>Un serveur Discord, c’est un espace avec des salons, des rôles et des règles. Les communautés de jeu de rôle s’en servent pour s’organiser, recruter et gérer leur économie.</p>'),
  ('Chez Wyatt', '<p>Des serveurs RP, des tickets, des candidatures, et des bots qui travaillent pendant qu’il dort. Enfin, pendant qu’il code autre chose.</p>'),
 ],
 see=['bots-discord', 'gta-rp'], refs=['Discord est une marque de Discord Inc.']),

dict(slug='phonk', cat='aime', title='Phonk', glyph='♪', tone='lilac',
 short='La musique officielle de mes sessions de code. À fond.',
 box=[('Type', 'Genre musical'), ('Origine', 'Rap de Memphis, années 1990'), ('Signes', 'Basses lourdes, cloche (cowbell)'), ('Volume conseillé', 'Trop fort')],
 lead='<b>La phonk</b> est un genre de musique électronique et de rap, inspiré du rap de Memphis des années 1990. Elle est devenue très populaire sur les réseaux sociaux, notamment dans les vidéos de voitures et de drift.',
 sections=[
  ('Définition', '<p>La phonk mélange des voix découpées, des basses très lourdes et une cloche reconnaissable entre mille, la fameuse « cowbell ». Le tempo donne envie d’accélérer. Ou de coder plus vite.</p>'),
  ('Chez Wyatt', '<p>C’est la bande-son de ses nuits de code. Une ligne par temps fort, à peu près ' + RN + '. En ce moment, il écoute aussi deux sons de la bande originale de GTA VI en boucle.</p>'),
 ],
 see=['gta-vi', 'nuit-blanche'], refs=['La page d’accueil, section « Dans mes oreilles ».']),

dict(slug='gta-vi', cat='aime', title='GTA VI', glyph='VI', tone='rose',
 short='Mon jeu préféré. Mais GTA V me manque quand même.',
 box=[('Type', 'Jeu vidéo'), ('Studio', 'Rockstar Games'), ('Lieu', 'Leonida, avec Vice City'), ('Statut', 'Jeu préféré de Wyatt'), ('Nostalgie', 'GTA V (2013)')],
 lead='<b>Grand Theft Auto VI</b> est un jeu vidéo en monde ouvert du studio Rockstar Games. Il se déroule dans l’État fictif de Leonida, inspiré de la Floride, avec le retour de Vice City. C’est le jeu préféré de Wyatt.',
 sections=[
  ('Définition', '<p>Dans un GTA, on explore une immense ville librement, on suit une histoire et on fait… à peu près tout ce qu’on veut. GTA VI arrive plus de dix ans après GTA V, sorti en 2013.</p>'),
  ('L’avis de Wyatt', '<p>Son préféré, sans hésiter. Mais il l’avoue : GTA V lui manque quand même. On ne remplace pas dix ans de souvenirs en un week-end.</p>'),
  ('La musique', '<p>Deux titres de la bande originale tournent en boucle chez lui : <i>Flower In A Hurricane</i> (Justice, avec Tame Impala, SZA et King Gizzard &amp; the Lizard Wizard) et <i>Burn This Shit Down</i> (Travis Scott).</p>'),
 ],
 see=['gta-rp', 'phonk', 'black-ops-6'], refs=['GTA et Grand Theft Auto sont des marques de Take-Two Interactive (Rockstar Games).']),

dict(slug='gta-rp', cat='aime', title='GTA RP', glyph='RP', tone='sand',
 short='Du jeu de rôle sur GTA. Là où je dirige une boîte qui n’existe pas.',
 box=[('Type', 'Jeu de rôle en ligne'), ('Personnage', 'Siroxtag LANDER'), ('Entreprise', 'Linear (fictive)'), ('Sérieux', 'Beaucoup trop')],
 lead='<b>Le GTA RP</b> (pour « roleplay ») consiste à jouer un personnage sur un serveur de GTA, avec des règles, comme dans une vraie ville. Chacun a un métier, une histoire et des comptes à rendre.',
 sections=[
  ('Définition', '<p>Des serveurs privés recréent une ville où les joueurs incarnent des policiers, des commerçants, des chefs d’entreprise. On ne joue pas pour gagner : on joue pour raconter une histoire.</p>'),
  ('Le personnage de Wyatt', '<p>Il y incarne Siroxtag LANDER, gérant de Linear, une entreprise fictive. Avec un vrai dossier de présentation en 17 plans. Normal.</p><p><a class="go" href="/Linear/">Voir le dossier Linear ›</a></p>'),
 ],
 see=['gta-vi', 'bots-discord', 'discord'], refs=['Tout ce qui se passe en RP est fictif.']),

dict(slug='black-ops-6', cat='aime', title='Call of Duty : Black Ops 6', glyph='6', tone='sky',
 short='Surtout pour la campagne. L’histoire d’abord.',
 box=[('Type', 'Jeu de tir'), ('Sortie', '2024'), ('Époque du jeu', 'Début des années 1990'), ('Mode préféré', 'La campagne')],
 lead='<b>Call of Duty : Black Ops 6</b> est un jeu de tir sorti en 2024. Sa campagne se déroule au début des années 1990. Wyatt y joue surtout pour l’histoire.',
 sections=[
  ('Définition', '<p>La série Black Ops est connue pour ses campagnes d’espionnage pleines de rebondissements. Personne n’est vraiment ce qu’il prétend être.</p>'),
  ('L’avis de Wyatt', '<p>La campagne d’abord, le reste après. Un bon scénario, c’est comme un bon code : on veut savoir comment ça finit.</p>'),
 ],
 see=['warzone', 'gta-vi'], refs=['Call of Duty et Black Ops sont des marques d’Activision.']),

dict(slug='warzone', cat='aime', title='Call of Duty : Warzone', glyph='WZ', tone='rose',
 short='Le dernier en date. Mon temps de survie reste secret.',
 box=[('Type', 'Battle royale'), ('Lancement', '2020'), ('Prix', 'Gratuit'), ('Temps de survie moyen', 'Classé secret-défense')],
 lead='<b>Call of Duty : Warzone</b> est un jeu de tir gratuit de type « battle royale » : de nombreux joueurs arrivent sur une carte, et le dernier en vie gagne.',
 sections=[
  ('Définition', '<p>La zone de jeu rétrécit au fil de la partie. Il faut trouver de l’équipement, rester discret et survivre. Facile à dire.</p>'),
  ('L’avis de Wyatt', '<p>Il joue au dernier en date. Ses statistiques ne seront pas publiées sur cette page, par respect pour lui ' + RN + '.</p>'),
 ],
 see=['black-ops-6', 'gta-vi'], refs=['Call of Duty et Warzone sont des marques d’Activision.']),

dict(slug='tiktok', cat='aime', title='TikTok', glyph='▶', tone='sand',
 short='Là où Siroxtag fait rire. Record : 45 300 vues en Ariana Grande.',
 box=[('Type', 'Réseau social vidéo'), ('Compte', '@siroxletag'), ('Style', 'Parodies, edits, humour'), ('Vidéo la plus vue', '45 300 vues')],
 lead='<b>TikTok</b> est un réseau social de vidéos courtes. Wyatt y publie sous le nom de Siroxtag : parodies, montages et humour.',
 sections=[
  ('Définition', '<p>Sur TikTok, un algorithme choisit les vidéos qu’on voit. Une vidéo peut passer de zéro à des milliers de vues en une nuit. Ou rester à 12 vues pour toujours.</p>'),
  ('Le record', '<p>La vidéo la plus vue de Siroxtag : lui, qui fait semblant d’être Ariana Grande. 45 300 vues. Il ne regrette rien.</p><p><a class="go" href="https://www.tiktok.com/@siroxletag" target="_blank" rel="noopener noreferrer">Voir @siroxletag ›</a></p>'),
 ],
 see=['sites-saas', 'phonk'], refs=['TikTok est une marque de ByteDance.']),

dict(slug='nuit-blanche', cat='aime', title='Nuit blanche', glyph='☾', tone='lilac',
 short='Record personnel : 4 jours. Ne faites pas ça chez vous.',
 box=[('Type', 'Mauvaise idée'), ('Record de Wyatt', '4 jours'), ('Cause', 'Du code'), ('Recommandé', 'Non')],
 lead='<b>Une nuit blanche</b> est une nuit passée sans dormir. Le record de Wyatt est de quatre jours. Cette page ne le félicite pas.',
 sections=[
  ('Définition', '<p>Le sommeil sert à récupérer, à mémoriser et à rester concentré. Sans lui, on fait plus d’erreurs, on réagit moins vite, et les bugs se multiplient. Ironique, pour un développeur.</p>'),
  ('Avertissement', '<p>Ne pas dormir pendant plusieurs jours est mauvais pour la santé. Wyatt le sait. Wyatt le déconseille. Wyatt code quand même à 3 h du matin ' + RN + '.</p>'),
 ],
 see=['code', 'manger-en-codant', 'bug'], refs=['<code>sommeil: null</code>, dans le code de la page d’accueil.']),

dict(slug='manger-en-codant', cat='aime', title='Manger en codant', glyph='🍕', tone='sand',
 short='Je mange tout en codant. Vraiment tout.',
 box=[('Type', 'Habitude'), ('Aliments concernés', 'Tous'), ('Victime principale', 'Le clavier'), ('Miettes retrouvées', 'Partout')],
 lead='<b>Manger en codant</b> est une technique qui consiste à ne jamais quitter son écran, même pour manger. Wyatt la maîtrise parfaitement.',
 sections=[
  ('Définition', '<p>Une main sur la souris, l’autre sur la nourriture. Le code avance, le repas aussi. Le clavier, lui, encaisse.</p>'),
  ('Menu', '<p>Tout. Absolument tout. Le clavier a déjà vu des choses qu’aucun clavier ne devrait voir ' + RN + '.</p>'),
 ],
 see=['nuit-blanche', 'code'], refs=['Le clavier, qui demande à rester anonyme.']),

dict(slug='bug', cat='aime', title='Le cache fantôme', glyph='?!', tone='rose',
 short='Mon pire bug : un cache fantôme et une hydratation silencieuse.',
 box=[('Type', 'Bug légendaire'), ('Lieu', 'En production'), ('Symptômes', 'Rien ne plante, tout est faux'), ('Séquelles', 'Cauchemars')],
 lead='<b>Le cache fantôme en production, combiné à une erreur d’hydratation silencieuse</b>, est le pire bug de la carrière de Wyatt. Rien ne plantait. Tout était faux.',
 sections=[
  ('C’est quoi, un cache ?', '<p>Un cache garde une copie d’une page pour l’afficher plus vite. Un cache « fantôme », c’est quand cette vieille copie continue d’apparaître alors que le site a changé. On corrige le bug, mais les visiteurs voient encore l’ancienne version.</p>'),
  ('C’est quoi, l’hydratation ?', '<p>Sur certains sites modernes, le serveur envoie d’abord une page toute faite. Ensuite, le JavaScript « hydrate » la page : il s’y accroche pour la rendre interactive. Si la page et le JavaScript ne racontent pas la même chose, c’est une erreur d’hydratation. Quand elle est silencieuse, aucun message ne prévient.</p>'),
  ('Le cocktail', '<p>Une vieille version servie par le cache, plus un JavaScript qui ne correspond plus. Résultat : des boutons qui ne répondent pas, des textes qui changent tout seuls, et aucun message d’erreur. Le genre de bug qui fait douter de tout.</p>'),
 ],
 see=['javascript', 'sites-saas', 'nuit-blanche'], refs=['Les cauchemars de Wyatt, 2026.']),

# ---------------- CE QUE JE VEUX FAIRE ----------------
dict(slug='policier', cat='veux', title='Policier', glyph='A', tone='sky', plan='Plan A',
 short='Plan A : policier sur le terrain. Protéger les gens pour de vrai.',
 box=[('Type', 'Métier'), ('Plan', 'A'), ('Rattachement', 'Ministère de l’Intérieur'), ('Accès', 'Sur concours'), ('Motivation', 'Protéger les gens')],
 lead='<b>Un policier</b> veille à la sécurité des personnes et des biens, fait respecter la loi et intervient en cas d’urgence. C’est le plan A de Wyatt : le terrain.',
 sections=[
  ('Le métier', '<p>En France, la Police nationale dépend du ministère de l’Intérieur. Le premier grade de terrain est celui de gardien de la paix. Le travail est varié : patrouilles, interventions, accueil des victimes, enquêtes.</p>'),
  ('Comment on y entre', '<p>On devient gardien de la paix par concours, puis on suit une formation en école de police. Les conditions exactes (âge, diplôme, nationalité, aptitude physique) sont publiées sur le site officiel de recrutement de la Police nationale. Elles peuvent changer, donc il faut toujours vérifier la version à jour.</p>'),
  ('Pourquoi Wyatt', '<p>Parce qu’il veut être utile, sur le terrain, au contact des gens. Et parce que courir après les méchants, c’est quand même plus sportif que courir après un bug.</p>'),
 ],
 see=['cyberpolicier', 'developpeur', 'filiere-generale'], refs=['Site officiel de recrutement de la Police nationale.']),

dict(slug='cyberpolicier', cat='veux', title='Cyberpolicier', glyph='B', tone='rose', plan='Plan B',
 short='Plan B : la police, mais derrière l’écran. Le code au service de la loi.',
 box=[('Type', 'Métier'), ('Plan', 'B'), ('Terrain', 'Internet'), ('Cibles', 'Arnaques, piratages, contenus illégaux'), ('Atout de Wyatt', 'Le code')],
 lead='<b>Un cyberpolicier</b> enquête sur les infractions commises sur Internet : arnaques, piratages, rançongiciels, contenus illégaux. C’est le plan B de Wyatt : la police, mais derrière l’écran.',
 sections=[
  ('Le métier', '<p>La cybercriminalité ne connaît pas de frontières. Les enquêteurs analysent des traces numériques, remontent des pistes et travaillent avec d’autres pays. En France, la police et la gendarmerie ont chacune des unités spécialisées, et la plateforme PHAROS reçoit les signalements de contenus illicites en ligne.</p>'),
  ('Comment on y entre', '<p>Plusieurs chemins existent : entrer dans la police ou la gendarmerie puis se spécialiser, ou rejoindre ces services comme technicien ou ingénieur, selon les concours ouverts. Une solide base en informatique et en sécurité est un vrai plus.</p>'),
  ('Pourquoi Wyatt', '<p>Il trouve déjà des failles avec la permission des sites. L’idée : mettre ce talent au service des enquêtes, pour attraper ceux qui, eux, ne demandent pas la permission.</p>'),
 ],
 see=['hacking-ethique', 'policier', 'developpeur'], refs=['Plateforme officielle de signalement PHAROS.', 'Article 323-1 du Code pénal.']),

dict(slug='developpeur', cat='veux', title='Développeur', glyph='C', tone='sage', plan='Plan C',
 short='Plan C : codeur. Spoiler : c’est déjà un peu le cas.',
 box=[('Type', 'Métier'), ('Plan', 'C'), ('Avancement', 'Déjà en cours'), ('Spécialité visée', 'Sites web et SaaS')],
 lead='<b>Un développeur</b> conçoit et écrit des logiciels, des sites et des applications. C’est le plan C de Wyatt. Le plus avancé, puisqu’il code déjà tous les jours.',
 sections=[
  ('Le métier', '<p>Le développeur transforme un besoin en programme qui fonctionne. Il écrit le code, le teste, le corrige et le fait évoluer. Il peut travailler en entreprise, en agence ou à son compte.</p>'),
  ('Le plan secret', '<p>Le plan de Wyatt n’est pas de choisir. C’est de faire les trois : policier sur le terrain, cyberpolicier derrière l’écran, et codeur. Attraper les méchants dans la rue <em>et</em> dans le code.</p>'),
 ],
 see=['code', 'sites-saas', 'policier', 'cyberpolicier'], refs=['Tout ce site, en guise de CV.']),

dict(slug='filiere-generale', cat='veux', title='Filière générale', glyph='Bac', tone='lilac', plan='Prochaine étape',
 short='La prochaine étape : le lycée général, et le bac qui va avec.',
 box=[('Type', 'Parcours scolaire'), ('Diplôme', 'Bac général'), ('Spécialités', '3 en première, 2 en terminale'), ('Statut', 'Objectif')],
 lead='<b>La filière générale</b> est la voie du lycée qui mène au baccalauréat général. C’est la prochaine étape du parcours de Wyatt.',
 sections=[
  ('Comment ça marche', '<p>Après la seconde générale et technologique, l’élève choisit trois spécialités en première, puis en garde deux en terminale. L’année se termine par les épreuves du bac, dont le Grand oral.</p>'),
  ('La spécialité qui fait rêver', '<p>Il existe une spécialité <b>NSI</b>, pour « Numérique et sciences informatiques ». On y apprend la programmation, les données, les réseaux. Pour quelqu’un qui code depuis la 6e, c’est un peu comme jouer à domicile ' + RN + '.</p>'),
  ('Et après ?', '<p>Le bac général ouvre de nombreuses portes : université, écoles, BUT informatique, concours. Exactement ce qu’il faut pour garder les plans A, B et C ouverts.</p>'),
 ],
 see=['policier', 'cyberpolicier', 'developpeur', 'python'], refs=['Site officiel du ministère de l’Éducation nationale.']),
]
