

// constructor
module.exports = (sequelize, Sequelize) => {
  const Image = sequelize.define("image", {
      file_name: {
          type: Sequelize.STRING
      },
      url: {
          type: Sequelize.STRING
      },
      user_id: {
          primaryKey: true,
          type: Sequelize.STRING
      },
      upload_date: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      timestamps: false
  });
  return Image;
}

