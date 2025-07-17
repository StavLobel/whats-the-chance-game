import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'מה הסיכוי?',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'Arial',
        useMaterial3: true,
      ),
      home: const Directionality(
        textDirection: TextDirection.rtl,
        child: LoginPage(),
      ),
      locale: const Locale('he'),
      supportedLocales: const [Locale('he')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String? _errorMessage;
  bool _isLoading = false;

  Future<void> _login() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    final url = Uri.parse('http://localhost:8000/users/login');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': _emailController.text,
          'password': _passwordController.text,
        }),
      );
      if (response.statusCode == 200) {
        // Success: show dialog or navigate
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('התחברת בהצלחה!'),
            content: const Text('ברוך הבא למה הסיכוי?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('סגור'),
              ),
            ],
          ),
        );
      } else {
        final data = jsonDecode(response.body);
        setState(() {
          _errorMessage = data['detail'] ?? 'שגיאה לא ידועה';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'שגיאת רשת: לא ניתן להתחבר לשרת';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      body: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Card(
                elevation: 6,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                margin: const EdgeInsets.symmetric(horizontal: 24),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 36),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'מה הסיכוי?',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'בחר אחת מהאפשרויות כדי להמשיך',
                        style: TextStyle(
                          fontSize: 16,
                          color: Color(0xFF7CB342),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      TextField(
                        controller: _emailController,
                        textAlign: TextAlign.right,
                        decoration: InputDecoration(
                          hintText: 'כתובת אימייל',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _passwordController,
                        textAlign: TextAlign.right,
                        obscureText: true,
                        decoration: InputDecoration(
                          hintText: 'סיסמה',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: _isLoading
                            ? null
                            : () {
                                setState(() {
                                  if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
                                    _errorMessage = 'אנא הזן כתובת אימייל וסיסמה';
                                  } else {
                                    _errorMessage = null;
                                    _login();
                                  }
                                });
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0057A3),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2.5,
                                ),
                              )
                            : const Text(
                                'התחבר',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                      ),
                      if (_errorMessage != null) ...[
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.black87,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  _errorMessage!,
                                  style: const TextStyle(color: Colors.white, fontSize: 16),
                                  textAlign: TextAlign.right,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close, color: Colors.white),
                                onPressed: () => setState(() => _errorMessage = null),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 12),
                      const Text(
                        'או המשך עם',
                        style: TextStyle(fontSize: 16, color: Color(0xFF7CB342)),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _SocialIconButton(icon: Icons.apple, onTap: () {}),
                          const SizedBox(width: 16),
                          _SocialIconButton(icon: Icons.facebook, onTap: () {}),
                          const SizedBox(width: 16),
                          _SocialIconButton(icon: Icons.g_mobiledata, onTap: () {}),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text('אין לך חשבון?', style: TextStyle(fontSize: 16)),
                          TextButton(
                            onPressed: () {},
                            child: const Text('הרשמה', style: TextStyle(fontSize: 16)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SocialIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _SocialIconButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Ink(
      decoration: const ShapeDecoration(
        color: Color(0xFFF1F3F4),
        shape: CircleBorder(),
      ),
      child: IconButton(
        icon: Icon(icon, size: 32, color: Colors.black87),
        onPressed: onTap,
      ),
    );
  }
}
