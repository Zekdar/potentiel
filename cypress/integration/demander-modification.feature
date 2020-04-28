# language: fr
Fonctionnalité: Demande de modification

  @porteur-projet
  Scénario: Modification du producteur
    Etant donné que mon compte est lié aux projets suivants
      | nomProjet | classe | notifiedOn |
      | projet 1  | Classé | 1234       |
    Lorsque je me rends sur la page qui liste mes projets
    Et que je click sur le bouton "Changer de producteur" au niveau de mon projet "projet 1"
    Et que je saisis la valeur "nouveau producteur" dans le champ "producteur"
    Et que je valide le formulaire
    Alors je suis redirigé vers la page qui liste mes demandes
    Et me notifie la réussite par "Votre demande a bien été prise en compte"
    Et je vois ma demande de modification "producteur" pour mon projet "projet 1"

