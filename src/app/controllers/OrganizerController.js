import Meetup from "../models/Meetup";

class OrganizerController {
  async index(req, res) {
    const organizer = await Meetup.findAll({ where: { user_id: req.userId } });

    return res.json(organizer);
  }
}

export default new OrganizerController();
