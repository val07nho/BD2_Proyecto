require("dotenv").config();
const oracledb = require("oracledb");

const SCHEMA = [
  `CREATE TABLE HUESPED (ID_HUESPED NUMBER PRIMARY KEY, DNI_PASAPORTE VARCHAR2(20) NOT NULL UNIQUE, NOMBRES VARCHAR2(80) NOT NULL, APELLIDOS VARCHAR2(80) NOT NULL, NACIONALIDAD VARCHAR2(40) NOT NULL, TELEFONO VARCHAR2(20) NOT NULL, CORREO VARCHAR2(100) NOT NULL UNIQUE)`,
  `CREATE TABLE HABITACION (ID_HABITACION NUMBER PRIMARY KEY, NUMERO_HABITACION VARCHAR2(10) NOT NULL UNIQUE, TIPO VARCHAR2(30) NOT NULL, PRECIO_NOCHE NUMBER(10,2) NOT NULL, CAPACIDAD NUMBER(2) NOT NULL, ESTADO VARCHAR2(20) NOT NULL, CONSTRAINT CK_HAB_ESTADO CHECK (ESTADO IN ('Disponible', 'Ocupada', 'Mantenimiento')))`,
  `CREATE TABLE RESERVA (ID_RESERVA NUMBER PRIMARY KEY, FECHA_RESERVA DATE NOT NULL, FECHA_INGRESO DATE NOT NULL, FECHA_SALIDA DATE NOT NULL, ESTADO VARCHAR2(20) NOT NULL, ID_HUESPED NUMBER NOT NULL, ID_HABITACION NUMBER NOT NULL, CONSTRAINT CK_RES_ESTADO CHECK (ESTADO IN ('Confirmada', 'Pendiente', 'Cancelada', 'Finalizada')), CONSTRAINT CK_RES_FECHAS CHECK (FECHA_SALIDA > FECHA_INGRESO), CONSTRAINT FK_RES_HUESPED FOREIGN KEY (ID_HUESPED) REFERENCES HUESPED(ID_HUESPED), CONSTRAINT FK_RES_HABITACION FOREIGN KEY (ID_HABITACION) REFERENCES HABITACION(ID_HABITACION))`,
  `CREATE TABLE FACTURA (ID_FACTURA NUMBER PRIMARY KEY, NUMERO_FACTURA VARCHAR2(20) NOT NULL UNIQUE, FECHA_EMISION DATE NOT NULL, MONTO_TOTAL NUMBER(12,2) NOT NULL, METODO_PAGO VARCHAR2(20) NOT NULL, ID_RESERVA NUMBER NOT NULL, CONSTRAINT CK_FAC_METODO CHECK (METODO_PAGO IN ('Tarjeta', 'Transferencia', 'Efectivo')), CONSTRAINT FK_FAC_RESERVA FOREIGN KEY (ID_RESERVA) REFERENCES RESERVA(ID_RESERVA))`,
  `CREATE TABLE PAGO (ID_PAGO NUMBER PRIMARY KEY, FECHA_PAGO DATE NOT NULL, MONTO NUMBER(12,2) NOT NULL, METODO VARCHAR2(20) NOT NULL, ID_FACTURA NUMBER NOT NULL, CONSTRAINT CK_PAGO_MET CHECK (METODO IN ('Tarjeta', 'Transferencia', 'Efectivo')), CONSTRAINT FK_PAGO_FACTURA FOREIGN KEY (ID_FACTURA) REFERENCES FACTURA(ID_FACTURA))`,
  `CREATE TABLE EVENTO (ID_EVENTO NUMBER PRIMARY KEY, CODIGO_EVENTO VARCHAR2(20) NOT NULL UNIQUE, NOMBRE VARCHAR2(80) NOT NULL, DESCRIPCION VARCHAR2(200), FECHA_EVENTO DATE NOT NULL, COSTO NUMBER(10,2) NOT NULL)`,
  `CREATE TABLE PARTICIPACION_EVENTO (ID_PARTICIPACION NUMBER PRIMARY KEY, ID_HUESPED NUMBER NOT NULL, ID_EVENTO NUMBER NOT NULL, FECHA_INSCRIPCION DATE NOT NULL, CONSTRAINT FK_PART_H FOREIGN KEY (ID_HUESPED) REFERENCES HUESPED(ID_HUESPED), CONSTRAINT FK_PART_E FOREIGN KEY (ID_EVENTO) REFERENCES EVENTO(ID_EVENTO), CONSTRAINT UQ_PART UNIQUE (ID_HUESPED, ID_EVENTO))`,
  `CREATE TABLE EMPLEADO (ID_EMPLEADO NUMBER PRIMARY KEY, NOMBRES VARCHAR2(80) NOT NULL, APELLIDOS VARCHAR2(80) NOT NULL, CARGO VARCHAR2(60) NOT NULL, CORREO VARCHAR2(100) UNIQUE, TELEFONO VARCHAR2(20))`,
  "CREATE SEQUENCE SEQ_HUESPED START WITH 1 INCREMENT BY 1",
  "CREATE SEQUENCE SEQ_HABITACION START WITH 1 INCREMENT BY 1",
  "CREATE SEQUENCE SEQ_RESERVA START WITH 1 INCREMENT BY 1",
  "CREATE SEQUENCE SEQ_FACTURA START WITH 1 INCREMENT BY 1",
  "CREATE SEQUENCE SEQ_PAGO START WITH 1 INCREMENT BY 1",
  "CREATE SEQUENCE SEQ_EVENTO START WITH 1 INCREMENT BY 1",
  "CREATE SEQUENCE SEQ_PARTICIPACION START WITH 1 INCREMENT BY 1",
  "CREATE SEQUENCE SEQ_EMPLEADO START WITH 1 INCREMENT BY 1",
  "CREATE INDEX IDX_RES_HUESPED ON RESERVA(ID_HUESPED)",
  "CREATE INDEX IDX_RES_HABITACION ON RESERVA(ID_HABITACION)",
  "CREATE INDEX IDX_FAC_RESERVA ON FACTURA(ID_RESERVA)",
  "CREATE INDEX IDX_PAGO_FAC ON PAGO(ID_FACTURA)",
  "CREATE INDEX IDX_PART_EV ON PARTICIPACION_EVENTO(ID_EVENTO)"
];

const nacs = ["Peru", "Chile", "Argentina"];
const tipos = ["Suite", "Deluxe", "Estandar"];
const caps = [4, 2, 3];
const estados = ["Confirmada", "Pendiente", "Cancelada", "Finalizada"];
const metodos = ["Tarjeta", "Transferencia", "Efectivo"];
const nombres_ev = ["Spa", "Piscina VIP", "Tour turistico", "Buceo", "Cena tematica"];
const cargos = ["Recepcionista", "Administrador", "Conserje", "Supervisor"];

const SEED = [
  ...Array.from({length:30},(_,i)=>{const n=i+1; return `INSERT INTO HUESPED VALUES(SEQ_HUESPED.NEXTVAL,'DOC${String(n).padStart(6,'0')}','Nombre${n}','Apellido${n}','${nacs[n%3]}','999${String(n).padStart(7,'0')}','huesped${n}@mail.com')`;}),
  ...Array.from({length:30},(_,i)=>{const n=i+1; return `INSERT INTO HABITACION VALUES(SEQ_HABITACION.NEXTVAL,'${100+n}','${tipos[n%3]}',${220+n*3},${caps[n%3]},'Disponible')`;}),
  ...Array.from({length:30},(_,i)=>{const n=i+1; return `INSERT INTO RESERVA VALUES(SEQ_RESERVA.NEXTVAL,SYSDATE-${n},TRUNC(SYSDATE)-${n%10},TRUNC(SYSDATE)+${n%10+1},'${estados[n%4]}',${n},${n})`;}),
  ...Array.from({length:30},(_,i)=>{const n=i+1; return `INSERT INTO FACTURA VALUES(SEQ_FACTURA.NEXTVAL,'FAC-${String(n).padStart(6,'0')}',SYSDATE-${n%15},${350+n*10},'${metodos[n%3]}',${n})`;}),
  ...Array.from({length:30},(_,i)=>{const n=i+1; return `INSERT INTO EVENTO VALUES(SEQ_EVENTO.NEXTVAL,'EV-${String(n).padStart(4,'0')}','${nombres_ev[n%5]}','Actividad ${n}',TRUNC(SYSDATE)+${n%14},${50+n*2})`;}),
  ...Array.from({length:30},(_,i)=>{const n=i+1; return `INSERT INTO EMPLEADO VALUES(SEQ_EMPLEADO.NEXTVAL,'Empleado${n}','Hotel${n}','${cargos[n%4]}','emp${n}@hrms.com','988${String(n).padStart(7,'0')}')`;}),
];

async function setup() {
  const user = process.env.ORACLE_USER;
  const password = process.env.ORACLE_PASSWORD;
  const connectString = process.env.ORACLE_CONNECT_STRING;
  const cfg = { user, password, connectString };
  if (user.toUpperCase() === "SYS") cfg.privilege = oracledb.SYSDBA;

  let conn;
  try {
    conn = await oracledb.getConnection(cfg);
    console.log("✅ Conectado a Oracle como", user);

    console.log("\n📦 Creando schema...");
    for (const sql of SCHEMA) {
      const label = sql.trim().split(/\s+/).slice(0,3).join(" ");
      try {
        await conn.execute(sql);
        console.log("  ✓", label);
      } catch(e) {
        if ([955, 1408].includes(e.errorNum)) console.log("  ⚠ (ya existe)", label);
        else console.error("  ✗", label, "-", e.message);
      }
    }

    console.log("\n🌱 Insertando datos...");
    let ok = 0, skip = 0;
    for (const sql of SEED) {
      try { await conn.execute(sql); ok++; }
      catch(e) { if (e.errorNum === 1) skip++; else console.error("  ✗", e.message); }
    }
    await conn.commit();
    console.log(`  ✓ ${ok} insertados, ${skip} duplicados omitidos`);
    console.log("\n🎉 Oracle listo. Reinicia el backend con: npm run dev");
  } catch(e) {
    console.error("❌ Error de conexión:", e.message);
  } finally {
    if (conn) await conn.close();
  }
}

setup();
