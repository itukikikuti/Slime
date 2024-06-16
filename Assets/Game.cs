using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.U2D;
using R3;
using R3.Triggers;
using Unity.VisualScripting;

public class Game : MonoBehaviour
{
    [SerializeField] private GameObject prefab = null;
    [SerializeField] private SpriteShapeController spriteShape = null;

    private const int div = 16;
    private GameObject core = null;
    private GameObject[] bodies = new GameObject[div];
    private SpringJoint2D[] arounds = new SpringJoint2D[div];
    private SpringJoint2D[] arounds2 = new SpringJoint2D[div];
    private SpringJoint2D[] diagonal = new SpringJoint2D[div];
    private SpringJoint2D[] radial = new SpringJoint2D[div];
    private bool pressed = false;
    private Vector2 mousePos = Vector2.zero;
    private Vector2 mouseOrigin = Vector2.zero;
    private int connectCount = 0;

    private void Start()
    {
        core = Instantiate(prefab);
        for (int i = 0; i < div; i++)
        {
            float r = (Mathf.PI * 2) / div * i;
            bodies[i] = Instantiate(prefab, new Vector3(Mathf.Cos(r) * 0.3f, Mathf.Sin(r) * 0.3f), Quaternion.identity);
            var body = bodies[i];
            body.OnCollisionEnter2DAsObservable().Subscribe(collision => {
                if (connectCount < 3)
                {
                    connectCount++;
                    var joint = body.AddComponent<FixedJoint2D>();
                }
            });
        }

        for (int i = 0; i < div; i++)
        {
            arounds[i] = bodies[i].AddComponent<SpringJoint2D>();
            arounds[i].connectedBody = bodies[(i + 1)  % div].GetComponent<Rigidbody2D>();
            arounds[i].frequency = 10.0f;

            arounds2[i] = bodies[i].AddComponent<SpringJoint2D>();
            arounds2[i].connectedBody = bodies[(i + 2) % div].GetComponent<Rigidbody2D>();
            arounds2[i].frequency = 10.0f;

            diagonal[i] = bodies[i].AddComponent<SpringJoint2D>();
            diagonal[i].connectedBody = bodies[(i + div / 2) % div].GetComponent<Rigidbody2D>();
            diagonal[i].frequency = 5.0f;

            radial[i] = bodies[i].AddComponent<SpringJoint2D>();
            radial[i].connectedBody = core.GetComponent<Rigidbody2D>();
            radial[i].frequency = 5.0f;
        }
    }

    private void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            pressed = true;
            mouseOrigin = Input.mousePosition;
        }

        if (Input.GetMouseButtonUp(0))
        {
            pressed = false;
        }

        float length = 0f;

        if (pressed)
        {
            mousePos = Input.mousePosition;
            length = Mathf.Sqrt(Mathf.Pow(mouseOrigin.x - mousePos.x, 2f) + Mathf.Pow(mouseOrigin.y - mousePos.y, 2f)) * 0.005f;
        }

        if (length > 1.5f)
        {
            length = 1.5f;
        }

        for (int i = 0; i < div; i++)
        {
            float r = (Mathf.PI * 2f) / div * i;
            float v = Mathf.Cos(r) * 0.3f;
            float h = Mathf.Sin(r) * (0.3f + length);

            r = (Mathf.PI * 2f) / div * ((i + 1) % div);
            float v2 = Mathf.Cos(r) * 0.3f;
            float h2 = Mathf.Sin(r) * (0.3f + length);

            r = (Mathf.PI * 2f) / div * ((i + 2) % div);
            float v3 = Mathf.Cos(r) * 0.3f;
            float h3 = Mathf.Sin(r) * (0.3f + length);

            r = (Mathf.PI * 2f) / div * ((i + div / 2) % div);
            float v4 = Mathf.Cos(r) * 0.3f;
            float h4 = Mathf.Sin(r) * (0.3f + length);

            arounds[i].distance = Mathf.Sqrt(Mathf.Pow(v - v2, 2) + Mathf.Pow(h - h2, 2));
            arounds2[i].distance = Mathf.Sqrt(Mathf.Pow(v - v3, 2) + Mathf.Pow(h - h3, 2));
            diagonal[i].distance = Mathf.Sqrt(Mathf.Pow(v - v4, 2) + Mathf.Pow(h - h4, 2));
            radial[i].distance = Mathf.Sqrt(Mathf.Pow(v, 2) + Mathf.Pow(h, 2));
        }

        for (int i = 0; i < div; i++)
        {
            Vector3 p = bodies[i].transform.position;
            Vector3 p1 = bodies[(i + div - 1) % div].transform.position;
            Vector3 p2 = bodies[(i + 1) % div].transform.position;
            float l1 = Vector3.Distance(p, p1) / 4f;
            float l2 = Vector3.Distance(p, p2) / 4f;
            Vector3 cp1 = (p1 - p).normalized * l1;
            Vector3 cp2 = (p2 - p).normalized * l2;
            Vector3 cp3 = (cp1 - cp2).normalized;
            cp3 = new Vector3(-cp3.y, cp3.x, 0f);
            cp1 = Vector3.ProjectOnPlane(cp1, cp3);
            cp2 = Vector3.ProjectOnPlane(cp2, cp3);

            Debug.DrawLine(p, p + cp1, Color.red);
            Debug.DrawLine(p, p + cp2, Color.red);
            spriteShape.spline.SetPosition(i, p);
            spriteShape.spline.SetLeftTangent(i, cp1);
            spriteShape.spline.SetRightTangent(i, cp2);
            spriteShape.spline.SetTangentMode(i, ShapeTangentMode.Continuous);
            spriteShape.spline.SetHeight(i, 0.1f);
        }
    }
}
