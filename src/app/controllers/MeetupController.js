import { parseISO, isBefore, startOfDay, endOfDay } from "date-fns";
import * as Yup from "yup";
import { Op } from "sequelize";
import Meetup from "../models/Meetup";
import User from "../models/User";

class MeetupController {
  async index(req, res) {
    const { page = 1 } = req.query;

    if (!req.query.date) {
      return res.status(400).json({ error: "invalid date" });
    }

    const searchDate = parseISO(req.query.date);
    const meetups = await Meetup.findAll({
      where: {
        date: { [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)] }
      },
      limit: 10,
      offset: (page - 1) * 10,
      include: [User]
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validations fail" });
    }

    /**
     * Verificar se a data já passou
     */

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: "Past dates are not permitted" });
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body,
      user_id
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validations fail" });
    }

    const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== user_id) {
      return res
        .status(401)
        .json({ error: "You don't have permission to update this meetup" });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: "Past dates are not permitted" });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't update past meetups." });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== user_id) {
      return res
        .status(400)
        .json({ error: "meetup can only be canceled by your organizer" });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't delete past meetups." });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
