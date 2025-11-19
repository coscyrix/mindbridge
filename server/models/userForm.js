import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const knex = require('knex');
import logger from '../config/winston.js';
import DBconn from '../config/db.config.js';

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

  async getUserForm(client_id, counselor_id, session_id) {
    try {
      const userForm = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('client_id', client_id)
        .andWhere('counselor_id', counselor_id)
        .andWhere('session_id', session_id);

      return userForm;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user form', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormByClientId(client_id, counselor_id) {
    try {
      const userForm = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('client_id', client_id)
        .andWhere('counselor_id', counselor_id);

      return userForm;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user form by client id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async updateUserForm(arrData) {
    try {
      for (const data of arrData) {
        const updateUserForm = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('user_forms')
          .where('client_id', data.client_id)
          .andWhere('counselor_id', data.counselor_id)
          .andWhere('form_id', data.form_id)
          .andWhere('session_id', data.session_id)
          .update({
            is_sent: data.is_sent,
            updated_at: new Date(),
          });

        if (!updateUserForm) {
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

  async putUserFormBySessionId(data) {
    try {
      const updateUserForm = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('session_id', data.session_id)
        .update({
          is_sent: data.is_sent,
          updated_at: new Date(),
        });

      if (typeof updateUserForm !== 'number') {
        logger.error('Error updating user form by session id');
        return { message: 'Error updating user form', error: -1 };
      }

      if (updateUserForm === 0) {
        return { message: 'No user forms found for session', warn: -1 };
      }

      return { message: 'User forms updated successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error updating user form', error: -1 };
    }
  }

  //////////////////////////////////////////

  async deleteUserForm(client_id, counselor_id, form_id, session_id) {
    try {
      const deleteUserForm = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('client_id', client_id)
        .andWhere('counselor_id', counselor_id)
        .andWhere('form_id', form_id)
        .andWhere('session_id', session_id)
        .del();

      if (!deleteUserForm) {
        logger.error('Error deleting user form');
        return { message: 'Error deleting user form', error: -1 };
      }

      return { message: 'User form deleted successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error deleting user form', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsByFormId(form_id, counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('form_id', form_id)
        .andWhere('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by form id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsBySessionId(session_id, counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('session_id', session_id)
        .andWhere('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by session id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsByClientIdAndFormId(client_id, form_id, counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('client_id', client_id)
        .andWhere('form_id', form_id)
        .andWhere('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by client id and form id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsByClientIdAndSessionId(client_id, session_id, counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('client_id', client_id)
        .andWhere('session_id', session_id)
        .andWhere('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by client id and session id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsByClientIdFormIdAndSessionId(client_id, form_id, session_id, counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('client_id', client_id)
        .andWhere('form_id', form_id)
        .andWhere('session_id', session_id)
        .andWhere('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by client id, form id and session id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsByFormIdAndSessionId(form_id, session_id, counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('form_id', form_id)
        .andWhere('session_id', session_id)
        .andWhere('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by form id and session id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsByCounselorId(counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by counselor id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsByClientId(client_id, counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('client_id', client_id)
        .andWhere('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by client id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsByFormId(form_id, counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('form_id', form_id)
        .andWhere('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by form id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsBySessionId(session_id, counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('session_id', session_id)
        .andWhere('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by session id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsByClientIdAndFormId(client_id, form_id, counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('client_id', client_id)
        .andWhere('form_id', form_id)
        .andWhere('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by client id and form id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsByClientIdAndSessionId(client_id, session_id, counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('client_id', client_id)
        .andWhere('session_id', session_id)
        .andWhere('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by client id and session id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsByClientIdFormIdAndSessionId(client_id, form_id, session_id, counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('client_id', client_id)
        .andWhere('form_id', form_id)
        .andWhere('session_id', session_id)
        .andWhere('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by client id, form id and session id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserFormsByFormIdAndSessionId(form_id, session_id, counselor_id) {
    try {
      const userForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('form_id', form_id)
        .andWhere('session_id', session_id)
        .andWhere('counselor_id', counselor_id);

      return userForms;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user forms by form id and session id', error: -1 };
    }
  }
  async getUserFormByFormIdAndSessionId(form_id, session_id) {
    try {
      const userForm = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('form_id', form_id)
        .andWhere('session_id', session_id);
  
      return userForm;
    }
    catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user form by id', error: -1 };
    }
  }

  async getUserFormByFormIdAndClientId(form_id, client_id) {
    try {
      const userForm = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_forms')
        .where('form_id', form_id)
        .andWhere('client_id', client_id);

      return userForm;
    }
    
    catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting user form by form id and client id', error: -1 };
    }
  }
}
