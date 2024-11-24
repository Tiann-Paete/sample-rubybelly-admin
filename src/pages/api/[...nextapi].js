import mysql from 'mysql2/promise';
import { parse } from 'url';
import { sign, verify } from 'jsonwebtoken';
import { authMiddleware } from '../../utils/authMiddleware';

const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+08:00'  
});

export default async function handler(req, res) {
  const { method } = req;
  const { pathname } = parse(req.url, true);

  try {
    switch (method) {
      case 'GET':
        if (pathname === '/api/check-auth') {
          return handleCheckAuth(req, res);
        } else  if (pathname === '/api/alechon-products') {
          return authMiddleware(handleGetLechonProducts)(req, res);
        } else if (pathname === '/api/aviand-products') {
          return authMiddleware(handleGetViandProducts)(req, res);
        } else if (pathname === '/api/astaff') {
          return authMiddleware(handleGetStaff)(req, res);
        } else if (pathname === '/api/acustomer') {
          return authMiddleware(handleGetCustomers)(req, res);
        } else if (pathname === '/api/ainventory') {
          return authMiddleware(handleGetInventory)(req, res);
        } else if (pathname === '/api/aorders') {
          return authMiddleware(handleGetOrders)(req, res);
        } else if (pathname === '/api/aorders') {
          return handleGetOrders(req, res);
        } 
        break;

        case 'POST':
          if (pathname === '/api/signin') {
            return handleSignIn(req, res);
          } else if (pathname === '/api/validate-pin') {
            return handleValidatePin(req, res);
          } else if (pathname === '/api/logout') {
            return handleLogout(req, res);
          } else  if (pathname === '/api/alechon-products') {
            return authMiddleware(handleAddLechonProduct)(req, res);
          } else if (pathname === '/api/aviand-products') {
            return authMiddleware(handleAddViandProduct)(req, res);
          } else if (pathname === '/api/astaff') {
            return authMiddleware(handleAddStaff)(req, res);
          } else if (pathname === '/api/acustomer') {
            return authMiddleware(handleAddCustomer)(req, res);
          } else if (pathname === '/api/ainventory') {
            return authMiddleware(handleAddInventory)(req, res);
          } else if (pathname === '/api/alechon-products') {
            return authMiddleware(handleAddLechonProduct)(req, res);
          }
          break;

          case 'PUT':
            if (pathname.startsWith('/api/alechon-products/')) {
              if (pathname.match(/^\/api\/alechon-products\/\d+\/soft-delete$/)) {
                const id = pathname.split('/')[3];
                return authMiddleware((req, res) => handleSoftDeleteLechonProduct(req, res, id))(req, res);
              } else {
                const id = pathname.split('/').pop();
                return authMiddleware((req, res) => handleUpdateLechonProduct(req, res, id))(req, res);
              }
            } else if (pathname.startsWith('/api/aviand-products/')) {
              if (pathname.match(/^\/api\/aviand-products\/\d+\/soft-delete$/)) {
                const id = pathname.split('/')[3];
                return authMiddleware((req, res) => handleSoftDeleteViandProduct(req, res, id))(req, res);
              } else {
                const id = pathname.split('/').pop();
                return authMiddleware((req, res) => handleUpdateViandProduct(req, res, id))(req, res);
              }
            }
             else if (pathname.startsWith('/api/astaff/')) {
              const staffId = pathname.split('/').pop();
              await handleUpdateStaff(req, res, staffId);
            } else if (pathname.startsWith('/api/acustomer/')) {
              const customerId = pathname.split('/').pop();
              await handleUpdateCustomer(req, res, customerId);
            } else if (pathname.startsWith('/api/ainventory/')) {
              await handleUpdateInventory(req, res);
            } else  if (pathname.match(/^\/api\/aorders\/\d+$/)) {
              const orderId = pathname.split('/').pop();
              return handleUpdateOrder(req, res, orderId);
            } else if (pathname.match(/^\/api\/aorders\/\d+\/soft-delete$/)) {
              const orderId = pathname.split('/')[3];
              return handleSoftDeleteOrder(req, res, orderId);
            }
            break;

      case 'DELETE':
        if (pathname.startsWith('/api/alechon-products/')) {
          const id = pathname.split('/').pop();
          return authMiddleware((req, res) => handleDeleteLechonProduct(req, res, id))(req, res);
        } else if (pathname.startsWith('/api/aproduct-prices/')) {
          const id = pathname.split('/').pop();
          return authMiddleware((req, res) => handleDeleteProductPrice(req, res, id))(req, res);
        } else if (pathname.startsWith('/api/astaff/')) {
          const staffId = pathname.split('/').pop();
          await handleDeleteStaff(req, res, staffId);
        } else if (pathname.startsWith('/api/acustomer/')) {
          const customerId = pathname.split('/').pop();
          await handleDeleteCustomer(req, res, customerId);
        } else if (pathname.startsWith('/api/ainventory/')) {
          await handleDeleteInventory(req, res);
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
}

async function handleGetViandProducts(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM aproducts_viands WHERE deleted = 0');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching Viand products:', error);
    res.status(500).json({ error: 'Failed to fetch Viand products' });
  }
}

async function handleAddViandProduct(req, res) {
  const { name, description, image_url, serves, quantity, price } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO aproducts_viands (name, description, image_url, serves, quantity, price) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, image_url, serves, quantity, price]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Error adding Viand product:', error);
    res.status(500).json({ error: 'Failed to add Viand product' });
  }
}

async function handleUpdateViandProduct(req, res, id) {
  const { name, description, image_url, serves, quantity, price } = req.body;
  try {
    await db.query(
      'UPDATE aproducts_viands SET name=?, description=?, image_url=?, serves=?, quantity=?, price=? WHERE productviands_id=?',
      [name, description, image_url, serves, quantity, price, id]
    );
    res.status(200).json({ message: 'Viand product updated successfully' });
  } catch (error) {
    console.error('Error updating Viand product:', error);
    res.status(500).json({ error: 'Failed to update Viand product' });
  }
}

async function handleSoftDeleteViandProduct(req, res, id) {
  try {
    await db.query('UPDATE aproducts_viands SET deleted = 1 WHERE productviands_id = ?', [id]);
    res.status(200).json({ message: 'Viand product soft deleted successfully' });
  } catch (error) {
    console.error('Error soft deleting Viand product:', error);
    res.status(500).json({ error: 'Failed to soft delete Viand product' });
  }
}

async function handleGetLechonProducts(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM aproducts_lechon WHERE deleted = 0');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching Lechon products:', error);
    res.status(500).json({ error: 'Failed to fetch Lechon products' });
  }
}

async function handleAddLechonProduct(req, res) {
  const { type, weight, description, image_url, price, quantity } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO aproducts_lechon (type, weight, description, image_url, price, quantity) VALUES (?, ?, ?, ?, ?, ?)',
      [type, weight, description, image_url, price, quantity]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Error adding Lechon product:', error);
    res.status(500).json({ error: 'Failed to add Lechon product' });
  }
}

async function handleUpdateLechonProduct(req, res, id) {
  const { type, weight, description, image_url, price, quantity } = req.body;
  try {
    await db.query(
      'UPDATE aproducts_lechon SET type=?, weight=?, description=?, image_url=?, price=?, quantity=? WHERE productlechon_id=?',
      [type, weight, description, image_url, price, quantity, id]
    );
    res.status(200).json({ message: 'Lechon product updated successfully' });
  } catch (error) {
    console.error('Error updating Lechon product:', error);
    res.status(500).json({ error: 'Failed to update Lechon product' });
  }
}

async function handleSoftDeleteLechonProduct(req, res, id) {
  try {
    await db.query('UPDATE aproducts_lechon SET deleted = 1 WHERE productlechon_id = ?', [id]);
    res.status(200).json({ message: 'Lechon product soft deleted successfully' });
  } catch (error) {
    console.error('Error soft deleting Lechon product:', error);
    res.status(500).json({ error: 'Failed to soft delete Lechon product' });
  }
}



// Signin
async function handleSignIn(req, res) {
  const { username, password } = req.body;
  const [result] = await db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password]);

  if (result.length === 0) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const user = result[0];
  const token = sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict`);
  res.status(200).json({ success: true, message: 'Signin successful', username: user.username });
}

// Validate PIN
async function handleValidatePin(req, res) {
  const { pin } = req.body;
  const [result] = await db.query('SELECT * FROM admin WHERE pin = ?', [pin]);

  if (result.length === 0) {
    return res.status(401).json({ error: 'Invalid pin' });
  }

  res.status(200).json({ success: true, message: 'Pin validated successfully' });
}


//Authentication
function handleCheckAuth(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({ isAuthenticated: false });
  }

  try {
    verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ isAuthenticated: true });
  } catch (error) {
    return res.status(200).json({ isAuthenticated: false });
  }
}

//Logout
function handleLogout(req, res) {
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
  res.status(200).json({ success: true, message: 'Logout successful' });
}







// Staff
async function handleGetStaff(req, res) {
  try {
    const [staff] = await db.query('SELECT * FROM astaff');
    res.status(200).json(staff);
    console.log('Staff fetched successfully');
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'An error occurred while fetching staff' });
  }
}

async function handleAddStaff(req, res) {
  const { name, position, contact } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO astaff (name, position, contact) VALUES (?, ?, ?)',
      [name, position, contact]
    );
    res.status(201).json({ id: result.insertId, name, position, contact });
    console.log('Staff member added successfully:', { id: result.insertId, name, position, contact });
  } catch (error) {
    console.error('Error adding staff member:', error);
    res.status(500).json({ error: 'An error occurred while adding the staff member' });
  }
}

async function handleUpdateStaff(req, res, id) {
  const { name, position, contact } = req.body;
  try {
    await db.query(
      'UPDATE astaff SET name = ?, position = ?, contact = ? WHERE staffid = ?',
      [name, position, contact, id]
    );
    res.status(200).json({ id, name, position, contact });
    console.log('Staff member updated successfully:', { id, name, position, contact });
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ error: 'An error occurred while updating the staff member' });
  }
}

async function handleDeleteStaff(req, res, id) {
  try {
    await db.query('DELETE FROM astaff WHERE staffid = ?', [id]);
    res.status(200).json({ message: 'Staff member deleted successfully' });
    console.log('Staff member deleted successfully:', id);
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ error: 'An error occurred while deleting the staff member' });
  }
}


// Customers
async function handleGetCustomers(req, res) {
  try {
    const [customers] = await db.query('SELECT * FROM acustomer');
    res.status(200).json(customers);
    console.log('Customers fetched successfully');
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'An error occurred while fetching customers' });
  }
}

async function handleAddCustomer(req, res) {
  const { name, emailaddress, address, contactNumber } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO acustomer (name, emailaddress, address, contactNumber) VALUES (?, ?, ?)',
      [name, emailaddress, address, contactNumber]
    );
    res.status(201).json({ id: result.insertId, name, emailaddress, address, contactNumber });
    console.log('Customer added successfully:', { id: result.insertId, name, emailaddress, address, contactNumber });
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({ error: 'An error occurred while adding the customer' });
  }
}

async function handleUpdateCustomer(req, res, id) {
  const { name, emailaddress, address, contactNumber } = req.body;
  try {
    await db.query(
      'UPDATE acustomer SET name = ?, emailaddress = ?, address = ?, contactNumber = ? WHERE customerid = ?',
      [name, emailaddress, address, contactNumber, id]
    );
    res.status(200).json({ id, name, emailaddress, address, contactNumber });
    console.log('Customer updated successfully:', { id, name, emailaddress, address, contactNumber });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'An error occurred while updating the customer' });
  }
}

async function handleDeleteCustomer(req, res, id) {
  try {
    await db.query('DELETE FROM acustomer WHERE customerid = ?', [id]);
    res.status(200).json({ message: 'Customer deleted successfully' });
    console.log('Customer deleted successfully:', id);
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'An error occurred while deleting the customer' });
  }
}

async function handleSoftDeleteOrder(req, res, orderId) {
  try {
    const [result] = await db.query(
      'UPDATE orders SET deleted = 1 WHERE orderid = ?',
      [orderId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error soft deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
}

// Modify your handleGetOrders function to exclude deleted orders
async function handleGetOrders(req, res) {
  try {
    const [orders] = await db.execute(`
      SELECT o.*, 
             GROUP_CONCAT(
               DISTINCT CONCAT(
                 CASE 
                   WHEN oi.productlechon_id IS NOT NULL THEN pl.type
                   WHEN oi.productviands_id IS NOT NULL THEN pv.name
                 END,
                 '|',
                 oi.quantity,
                 '|',
                 oi.price_at_time
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.orderid = oi.orderid
      LEFT JOIN aproducts_lechon pl ON oi.productlechon_id = pl.productlechon_id
      LEFT JOIN aproducts_viands pv ON oi.productviands_id = pv.productviands_id
      WHERE o.deleted = 0
      GROUP BY o.orderid
      ORDER BY o.date DESC
    `);

    // Process the orders to parse the grouped items
    const processedOrders = orders.map(order => {
      const items = order.items ? order.items.split(',').map(item => {
        const [name, quantity, price] = item.split('|');
        return { name, quantity: parseInt(quantity), price: parseFloat(price) };
      }) : [];

      return {
        ...order,
        items,
        date: new Date(order.date).toISOString(),
      };
    });

    res.status(200).json(processedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function handleUpdateOrder(req, res, orderId) {
  const { status, date } = req.body;
  let connection;
  
  try {
    // Get a connection from the pool
    connection = await db.getConnection();

    // Start a transaction
    await connection.beginTransaction();

    if (status) {
      await connection.execute(
        'UPDATE orders SET status = ? WHERE orderid = ?',
        [status, orderId]
      );
    }

    if (date) {
      await connection.execute(
        'UPDATE orders SET date = ? WHERE orderid = ?',
        [new Date(date), orderId]
      );
    }

    // Get the updated order with items
    const [updatedOrders] = await connection.execute(`
      SELECT o.*, 
             GROUP_CONCAT(
               DISTINCT CONCAT(
                 CASE 
                   WHEN oi.productlechon_id IS NOT NULL THEN pl.type
                   WHEN oi.productviands_id IS NOT NULL THEN pv.name
                 END,
                 '|',
                 oi.quantity,
                 '|',
                 oi.price_at_time
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.orderid = oi.orderid
      LEFT JOIN aproducts_lechon pl ON oi.productlechon_id = pl.productlechon_id
      LEFT JOIN aproducts_viands pv ON oi.productviands_id = pv.productviands_id
      WHERE o.orderid = ?
      GROUP BY o.orderid
    `, [orderId]);

    // Commit the transaction
    await connection.commit();

    if (updatedOrders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Process the order items
    const order = updatedOrders[0];
    const items = order.items ? order.items.split(',').map(item => {
      const [name, quantity, price] = item.split('|');
      return { name, quantity: parseInt(quantity), price: parseFloat(price) };
    }) : [];

    const processedOrder = {
      ...order,
      items,
      date: new Date(order.date).toISOString()
    };

    res.status(200).json(processedOrder);
  } catch (error) {
    // Rollback the transaction if there was an error
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
}






// Pwede rani nimo i continue pero inig naa error or dili maka update or delete or add double check lng sa frontend
// ug sa taas ani na declaration katung sa split pop method


/*
async function handleGetInventory(req, res) {
  const [results] = await db.query('SELECT * FROM ainventory');
  res.status(200).json(results);
}

async function handleAddInventory(req, res) {
  const { id, quantity, supplierId, remainingStock, dateAdded, status } = req.body;
  const [result] = await db.query('INSERT INTO ainventory (id, quantity, supplierId, remainingStock, dateAdded, status) VALUES (?, ?, ?, ?, ?, ?)', [id, quantity, supplierId, remainingStock, dateAdded, status]);
  res.status(201).json({ message: 'Inventory item added' });
}

async function handleUpdateInventory(req, res) {
  const { id } = req.query;
  const { quantity, supplierId, remainingStock, dateAdded, status } = req.body;
  const [result] = await db.query('UPDATE ainventory SET quantity = ?, supplierId = ?, remainingStock = ?, dateAdded = ?, status = ? WHERE id = ?', [quantity, supplierId, remainingStock, dateAdded, status, id]);
  res.status(200).json({ message: 'Inventory item updated' });
}

async function handleDeleteInventory(req, res) {
  const { id } = req.query;
  const [result] = await db.query('DELETE FROM ainventory WHERE id = ?', [id]);
  res.status(200).json({ message: 'Inventory item deleted' });
}
*/
