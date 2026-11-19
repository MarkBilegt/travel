-- Comments that travellers left publicly on the cooperative's old site
-- (sainsanaa.net, pages "Chi siamo" and "Contact us"), copied word for word.
--
-- They are inserted HIDDEN (consent_given = false, active = false). Before
-- showing any of them, the cooperative should ask each person for permission to
-- republish their words on the new site, then tick the consent box and "Show on
-- the website" in Admin > Testimonials. Full names are not stored: only the
-- first name that appeared with the comment.

INSERT INTO testimonials (name, country, quote, language, trip, consent_given, active, sort_order) VALUES
  ('Attilio', 'Italia', 'A nome del gruppo (17bikers) vorrei ringraziare Alfredo per il bellissimo e affascinante viaggio ciclistico che ci hai organizzato, ci hai fatto vivere una vacanza stupenda, un grazie meritatissimo anche a tutti i tuoi collaboratori che ci hanno accompagnato in questa particolare esperienza.', 'it', 'Viaggio in bicicletta, gruppo di 17', false, false, 1),
  ('Viaggiatrice', 'Italia', 'Viaggio quasi sempre da sola, non amo unirmi a gruppi organizzati, ma per la Mongolia ho fatto un’eccezione ed è stata una scelta vincente! Alfredo ha fatto la differenza perché ha riempito ogni esperienza di informazioni storiche e culturali, con passione ed allegria: mi ha fatto comprendere molti aspetti di questo splendido paese, che da sola o con guide poco competenti non avrei neanche intuito. Consiglio senza alcun dubbio di affidarsi a Sain Sanaa, anche perché il loro coinvolgimento nell’aiutare le realtà locali è palese e concreto.', 'it', NULL, false, false, 2),
  ('Omar', 'Italia', 'Grazie ad Alfredo e Soko per averci organizzato la bella avventura e per la rapida assistenza durante il viaggio.', 'it', NULL, false, false, 3),
  ('Viaggiatore', 'Italia', 'Grazie, grazie e ancora grazie ad Alfredo e i suoi collaboratori per il meraviglioso viaggio che mi ha aiutato ad organizzare. Non solo un viaggio della mente e del cuore, ma anche un’esperienza umana indescrivibile. Un grazie speciale ad Oyuka e Gana per essere stati dei veri compagni di avventura.', 'it', NULL, false, false, 4);
