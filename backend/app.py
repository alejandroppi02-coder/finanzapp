from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

# Inicializar la aplicación
app = Flask(__name__)
CORS(app)  # Permitir conexiones desde el frontend

# Configurar la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///finanzas.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar la base de datos
db = SQLAlchemy(app)

# MODELOS DE BASE DE DATOS
class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)

class Categoria(db.Model):
    __tablename__ = 'categorias'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    tipo = db.Column(db.String(10), nullable=False)  # 'ingreso' o 'gasto'
    color = db.Column(db.String(20), default='#808080')

class Transaccion(db.Model):
    __tablename__ = 'transacciones'
    id = db.Column(db.Integer, primary_key=True)
    cantidad = db.Column(db.Float, nullable=False)
    descripcion = db.Column(db.String(200))
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    tipo = db.Column(db.String(10), nullable=False)  # 'ingreso' o 'gasto'
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'), nullable=False)

# RUTAS DE LA API
@app.route('/')
def home():
    return jsonify({
        'mensaje': 'Bienvenido a FinanzApp API',
        'version': '1.0',
        'endpoints': [
            '/api/usuarios',
            '/api/categorias',
            '/api/transacciones'
        ]
    })

@app.route('/api/usuarios', methods=['GET', 'POST'])
def manejar_usuarios():
    if request.method == 'GET':
        usuarios = Usuario.query.all()
        return jsonify([{
            'id': u.id,
            'nombre': u.nombre,
            'email': u.email,
            'fecha_registro': u.fecha_registro.strftime('%Y-%m-%d')
        } for u in usuarios])
    
    elif request.method == 'POST':
        datos = request.json
        nuevo_usuario = Usuario(
            nombre=datos['nombre'],
            email=datos['email'],
            password=datos['password']
        )
        db.session.add(nuevo_usuario)
        db.session.commit()
        return jsonify({'mensaje': 'Usuario creado', 'id': nuevo_usuario.id}), 201

@app.route('/api/categorias', methods=['GET', 'POST'])
def manejar_categorias():
    if request.method == 'GET':
        categorias = Categoria.query.all()
        return jsonify([{
            'id': c.id,
            'nombre': c.nombre,
            'tipo': c.tipo,
            'color': c.color
        } for c in categorias])
    
    elif request.method == 'POST':
        datos = request.json
        nueva_categoria = Categoria(
            nombre=datos['nombre'],
            tipo=datos['tipo'],
            color=datos.get('color', '#808080')
        )
        db.session.add(nueva_categoria)
        db.session.commit()
        return jsonify({'mensaje': 'Categoría creada', 'id': nueva_categoria.id}), 201

@app.route('/api/transacciones', methods=['GET', 'POST'])
@app.route('/api/transacciones/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def manejar_transacciones(id=None):
    # GET todas las transacciones
    if request.method == 'GET' and id is None:
        transacciones = Transaccion.query.all()
        return jsonify([{
            'id': t.id,
            'cantidad': t.cantidad,
            'descripcion': t.descripcion,
            'fecha': t.fecha.strftime('%Y-%m-%d'),
            'tipo': t.tipo,
            'usuario_id': t.usuario_id,
            'categoria_id': t.categoria_id
        } for t in transacciones])
    
    # GET una transacción específica
    elif request.method == 'GET' and id is not None:
        transaccion = Transaccion.query.get(id)
        if transaccion:
            return jsonify({
                'id': transaccion.id,
                'cantidad': transaccion.cantidad,
                'descripcion': transaccion.descripcion,
                'fecha': transaccion.fecha.strftime('%Y-%m-%d'),
                'tipo': transaccion.tipo,
                'usuario_id': transaccion.usuario_id,
                'categoria_id': transaccion.categoria_id
            })
        return jsonify({'error': 'Transacción no encontrada'}), 404
    
    # POST crear nueva transacción
    elif request.method == 'POST':
        datos = request.json
        nueva_transaccion = Transaccion(
            cantidad=datos['cantidad'],
            descripcion=datos.get('descripcion', ''),
            tipo=datos['tipo'],
            usuario_id=datos['usuario_id'],
            categoria_id=datos['categoria_id']
        )
        db.session.add(nueva_transaccion)
        db.session.commit()
        return jsonify({'mensaje': 'Transacción creada', 'id': nueva_transaccion.id}), 201
    
    # PUT actualizar transacción
    elif request.method == 'PUT':
        transaccion = Transaccion.query.get(id)
        if not transaccion:
            return jsonify({'error': 'Transacción no encontrada'}), 404
        
        datos = request.json
        transaccion.cantidad = datos.get('cantidad', transaccion.cantidad)
        transaccion.descripcion = datos.get('descripcion', transaccion.descripcion)
        transaccion.tipo = datos.get('tipo', transaccion.tipo)
        transaccion.categoria_id = datos.get('categoria_id', transaccion.categoria_id)
        
        db.session.commit()
        return jsonify({'mensaje': 'Transacción actualizada'})
    
    # DELETE eliminar transacción
    elif request.method == 'DELETE':
        transaccion = Transaccion.query.get(id)
        if not transaccion:
            return jsonify({'error': 'Transacción no encontrada'}), 404
        
        db.session.delete(transaccion)
        db.session.commit()
        return jsonify({'mensaje': 'Transacción eliminada'})

# Comando para inicializar la base de datos
@app.cli.command('init-db')
def init_db_command():
    """Inicializar la base de datos"""
    db.create_all()
    
    # Crear categorías por defecto
    categorias_default = [
        {'nombre': 'Salario', 'tipo': 'ingreso', 'color': '#4CAF50'},
        {'nombre': 'Freelance', 'tipo': 'ingreso', 'color': '#2196F3'},
        {'nombre': 'Alimentación', 'tipo': 'gasto', 'color': '#F44336'},
        {'nombre': 'Transporte', 'tipo': 'gasto', 'color': '#FF9800'},
        {'nombre': 'Entretenimiento', 'tipo': 'gasto', 'color': '#9C27B0'},
        {'nombre': 'Servicios', 'tipo': 'gasto', 'color': '#795548'},
    ]
    
    for cat in categorias_default:
        if not Categoria.query.filter_by(nombre=cat['nombre']).first():
            categoria = Categoria(**cat)
            db.session.add(categoria)
    
    db.session.commit()
    print('Base de datos inicializada correctamente')

if __name__ == '__main__':
    print("🚀 Iniciando servidor FinanzApp...")
    print("🌐 Servidor disponible en: http://127.0.0.1:5000")
    app.run(debug=True, port=5000)