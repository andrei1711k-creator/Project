"""Add is_admin field to User

Revision ID: c4127669b335
Revises: 8189800a3336
Create Date: 2024-12-16 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c4127669b335'
down_revision = '8189800a3336'
branch_labels = None
depends_on = None


def upgrade():
    # Для SQLite: добавляем поле is_admin через создание новой таблицы
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_admin', sa.Boolean(), nullable=True, server_default=sa.text('0')))

    # Обновляем существующие записи: первый пользователь становится админом
    op.execute("""
        UPDATE users 
        SET is_admin = 1 
        WHERE id = (SELECT MIN(id) FROM users)
    """)

    # Делаем поле NOT NULL после заполнения
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('is_admin',
               existing_type=sa.Boolean(),
               nullable=False,
               server_default=sa.text('0'))


def downgrade():
    # Удаляем поле is_admin
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('is_admin')