import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class UserForm {
  //////////////////////////////////////////

  async postUserForm(arrData) {
    try {
      for (const data of arrData) {
        const tmpUserForm = {
          client_id: data.client_id,
          counselor_id: data.counselor_id,
          form_id: data.form_id,
          session_id: data.session_id,
          is_sent: data.is_sent,
          tenant_id: data.tenant_id,
        };

        const postUserForm = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('user_forms')
          .insert(tmpUserForm);

        if (!postUserForm) {
          logger.error('Error creating user form');
          return { message: 'Error creating user form', error: -1 };
        }
      }

      return { message: 'User form created successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error creating user form', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putUserFormById(data) {
    try {
      const tmpUserForm = {
        client_id: data.client_id,
        form_id: data.form_id,
        session_id: data.session_id,
        is_sent: data.is_sent,
        form_submit: data.form_submit,
        status_yn: data.status_yn,
      };

      const putUserForm = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('user_form_id', data.user_form_id)
        .update(tmpUserForm);

      if (!putUserForm) {
        logger.error('Error updating user form');
        return { message: 'Error updating user form', error: -1 };
      }

      return { message: 'User form updated successfully' };
    } catch (error) {
      logger.error(error);
      return { message: 'Error updating user form', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putUserFormBySessionId(data) {
    try {
      const tmpUserForm = {
        is_sent: data.is_sent,
        form_submit: data.form_submit,
        status_yn: data.status_yn,
      };

      const putUserForm = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('session_id', data.session_id)
        .update(tmpUserForm);

      if (!putUserForm) {
        logger.error('Error updating user form');
        return { message: 'Error updating user form', error: -1 };
      }

      return { message: 'User form updated successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error updating user form', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putUserFormBySessionIdAndFormID(data) {
    try {
      const tmpUserForm = {
        is_sent: data.is_sent,
        form_submit: data.form_submit,
        status_yn: data.status_yn,
      };
      if (data.session_id) {
        const putUserForm = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('user_forms')
          .where('form_id', data.form_id)
          .andWhere('session_id', data.session_id)
          .update(tmpUserForm);

        if (!putUserForm) {
          logger.error('Error updating user form');
          return { message: 'Error updating user form', error: -1 };
        }
      } else if (data.client_id) {
        const putUserForm = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('user_forms')
          .where('form_id', data.form_id)
          .andWhere('client_id', data.client_id)
          .update(tmpUserForm);

        if (!putUserForm) {
          logger.error('Error updating user form');
          return { message: 'Error updating user form', error: -1 };
        }
      }

      return { message: 'User form updated successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error updating user form', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormById(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_user_form');

      if (data.user_form_id) {
        query = query.andWhere('user_form_id', data.user_form_id);
      }

      if (data.client_id) {
        query = query.andWhere('client_id', data.client_id);
      }

      if (data.counselor_id) {
        query = query.andWhere('counselor_id', data.counselor_id);
      }

      if (data.session_id) {
        query = query.andWhere('session_id', data.session_id);
      }

      if (data.form_id) {
        query = query.andWhere('form_id', data.form_id);
      }

      if (data.start_date) {
        query = query.andWhere('intake_date', '>=', data.start_date);
      }

      if (data.end_date) {
        query = query.andWhere('intake_date', '<=', data.end_date);
      }

      if (data.is_sent) {
        query = query.andWhere('is_sent', data.is_sent);
      }

      if (data.form_submit) {
        query = query.andWhere('form_submit', data.form_submit);
      }

      if (data.tenant_id) {
        query = query.andWhere('tenant_id', data.tenant_id);
      }

      const rec = await query;
      if (!rec) {
        logger.error('Error getting user form');
        return { message: 'Error getting user form', error: -1 };
      }
      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting user form', error: -1 };
    }
  }
}
